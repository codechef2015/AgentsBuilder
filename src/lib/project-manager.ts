/**
 * Project Manager — Dual Storage (localStorage + Backend DB)
 * 
 * localStorage = primary (fast, offline-capable)
 * Backend DB = secondary (auto-synced in background, shared across devices)
 * 
 * Projects are namespaced by framework so Strands and ADK never conflict.
 */

import { type Node, type Edge } from '@xyflow/react';
import type { FrameworkId } from '../frameworks/types';

export interface StrandsProject {
  id: string;
  name: string;
  description?: string;
  framework?: FrameworkId;
  nodes: Node[];
  edges: Edge[];
  graphMode?: boolean;
  createdAt: string;
  updatedAt: string;
  version: string;
  syncedToDb?: boolean;
}

// ─── Storage Keys (namespaced by framework) ──────────────────────

function getStorageKey(framework?: FrameworkId): string {
  if (framework === 'google-adk') return 'agent_studio_projects_adk';
  return 'agent_studio_projects_strands';
}

function getCurrentProjectKey(framework?: FrameworkId): string {
  if (framework === 'google-adk') return 'agent_studio_current_project_adk';
  return 'agent_studio_current_project_strands';
}

// ─── Backend Sync (fire-and-forget) ──────────────────────────────

const API_BASE = '/api/projects';

async function syncToBackend(project: StrandsProject): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: project.id,
        name: project.name,
        description: project.description || '',
        framework: project.framework || 'strands',
        flow_data: {
          nodes: project.nodes,
          edges: project.edges,
          graphMode: project.graphMode || false,
        },
        graph_mode: project.graphMode || false,
        version: project.version,
      }),
    });

    if (response.ok) {
      return true;
    }

    // If 404, try creating instead
    if (response.status === 404) {
      const createResponse = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          name: project.name,
          description: project.description || '',
          framework: project.framework || 'strands',
          flow_data: {
            nodes: project.nodes,
            edges: project.edges,
            graphMode: project.graphMode || false,
          },
          graph_mode: project.graphMode || false,
          version: project.version,
        }),
      });
      return createResponse.ok;
    }

    return false;
  } catch {
    // Backend unavailable — localStorage still works
    return false;
  }
}

async function deleteFromBackend(projectId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${projectId}`, { method: 'DELETE' });
    return response.ok;
  } catch {
    return false;
  }
}

// ─── ProjectManager Class ────────────────────────────────────────

export class ProjectManager {
  private static currentFramework: FrameworkId = 'strands';

  /**
   * Set the active framework context. Call this when framework changes.
   */
  static setFramework(framework: FrameworkId): void {
    this.currentFramework = framework;
  }

  /**
   * Save a new project (localStorage + background DB sync).
   */
  static saveProject(project: Omit<StrandsProject, 'id' | 'createdAt' | 'updatedAt' | 'version'>): StrandsProject {
    const now = new Date().toISOString();
    const framework = project.framework || this.currentFramework;
    const savedProject: StrandsProject = {
      id: `project_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      version: '1.0.0',
      framework,
      syncedToDb: false,
      ...project,
    };

    const projects = this.getAllProjects(framework);
    projects.push(savedProject);
    localStorage.setItem(getStorageKey(framework), JSON.stringify(projects));

    // Background sync to DB
    syncToBackend(savedProject).then(synced => {
      if (synced) {
        this.markSynced(savedProject.id, framework);
      }
    });

    return savedProject;
  }

  /**
   * Update an existing project (localStorage + background DB sync).
   */
  static updateProject(projectId: string, updates: Partial<StrandsProject>, framework?: FrameworkId): StrandsProject | null {
    const fw = framework || this.currentFramework;
    const projects = this.getAllProjects(fw);
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return null;
    }

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      syncedToDb: false,
    };

    localStorage.setItem(getStorageKey(fw), JSON.stringify(projects));

    // Background sync to DB
    syncToBackend(projects[projectIndex]).then(synced => {
      if (synced) {
        this.markSynced(projectId, fw);
      }
    });

    return projects[projectIndex];
  }

  /**
   * Load a specific project by ID.
   */
  static loadProject(projectId: string, framework?: FrameworkId): StrandsProject | null {
    const fw = framework || this.currentFramework;
    const projects = this.getAllProjects(fw);
    return projects.find(p => p.id === projectId) || null;
  }

  /**
   * Delete a project (localStorage + backend DB).
   */
  static deleteProject(projectId: string, framework?: FrameworkId): boolean {
    const fw = framework || this.currentFramework;
    const projects = this.getAllProjects(fw);
    const filteredProjects = projects.filter(p => p.id !== projectId);

    if (filteredProjects.length === projects.length) {
      return false;
    }

    localStorage.setItem(getStorageKey(fw), JSON.stringify(filteredProjects));

    // Background delete from DB
    deleteFromBackend(projectId);

    return true;
  }

  /**
   * Get all projects for a specific framework.
   * If no framework specified, uses current active framework.
   */
  static getAllProjects(framework?: FrameworkId): StrandsProject[] {
    const fw = framework || this.currentFramework;
    try {
      const stored = localStorage.getItem(getStorageKey(fw));
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load projects:', error);
      return [];
    }
  }

  /**
   * Set the current active project for the active framework.
   */
  static setCurrentProject(projectId: string, framework?: FrameworkId): void {
    const fw = framework || this.currentFramework;
    localStorage.setItem(getCurrentProjectKey(fw), projectId);
  }

  /**
   * Get the current active project for the active framework.
   */
  static getCurrentProject(framework?: FrameworkId): StrandsProject | null {
    const fw = framework || this.currentFramework;
    const currentId = localStorage.getItem(getCurrentProjectKey(fw));
    if (!currentId) return null;
    return this.loadProject(currentId, fw);
  }

  /**
   * Clear current project selection.
   */
  static clearCurrentProject(framework?: FrameworkId): void {
    const fw = framework || this.currentFramework;
    localStorage.removeItem(getCurrentProjectKey(fw));
  }

  /**
   * Export project as JSON string.
   */
  static exportProject(project: StrandsProject): string {
    return JSON.stringify(project, null, 2);
  }

  /**
   * Import a project from JSON.
   */
  static importProject(jsonData: string, framework?: FrameworkId): StrandsProject | null {
    try {
      const project = JSON.parse(jsonData);

      if (!project.nodes || !project.edges || !project.name) {
        throw new Error('Invalid project format');
      }

      // Use the framework from the imported file, or the active one
      const fw = project.framework || framework || this.currentFramework;

      return this.saveProject({
        name: project.name + ' (Imported)',
        description: project.description,
        framework: fw,
        nodes: project.nodes,
        edges: project.edges,
        graphMode: project.graphMode || false,
      });
    } catch (error) {
      console.error('Failed to import project:', error);
      return null;
    }
  }

  /**
   * Mark a project as synced to DB (internal).
   */
  private static markSynced(projectId: string, framework?: FrameworkId): void {
    const fw = framework || this.currentFramework;
    const projects = this.getAllProjects(fw);
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx !== -1) {
      projects[idx].syncedToDb = true;
      localStorage.setItem(getStorageKey(fw), JSON.stringify(projects));
    }
  }

  /**
   * Sync all unsynced projects to backend (call on app load).
   */
  static async syncPendingProjects(framework?: FrameworkId): Promise<number> {
    const fw = framework || this.currentFramework;
    const projects = this.getAllProjects(fw);
    const unsynced = projects.filter(p => !p.syncedToDb);
    let synced = 0;

    for (const project of unsynced) {
      const success = await syncToBackend(project);
      if (success) {
        this.markSynced(project.id, fw);
        synced++;
      }
    }

    return synced;
  }

  // ─── Legacy Compatibility ──────────────────────────────────────
  // Migrate old 'strands_projects' key to new namespaced format

  static migrateFromLegacy(): void {
    try {
      const legacy = localStorage.getItem('strands_projects');
      if (legacy) {
        const projects: StrandsProject[] = JSON.parse(legacy);
        if (projects.length > 0) {
          // All legacy projects are Strands
          const existing = this.getAllProjects('strands');
          const existingIds = new Set(existing.map(p => p.id));
          const newProjects = projects.filter(p => !existingIds.has(p.id));

          if (newProjects.length > 0) {
            const merged = [...existing, ...newProjects.map(p => ({ ...p, framework: 'strands' as FrameworkId }))];
            localStorage.setItem(getStorageKey('strands'), JSON.stringify(merged));
          }

          // Remove legacy key
          localStorage.removeItem('strands_projects');
          localStorage.removeItem('current_strands_project');
        }
      }

      // Also clean up old auto-save keys that might have stale data
      localStorage.removeItem('strands_autosave_flow');
      localStorage.removeItem('agent_studio_autosave_flow');
    } catch {
      // Ignore migration errors
    }
  }
}
