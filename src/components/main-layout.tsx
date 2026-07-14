import { useState, useCallback, useEffect } from 'react';
import { type Node, type Edge } from '@xyflow/react';
import { Code, Eye, EyeOff, FolderOpen, Terminal, Save, Plus, Download, Upload, Rocket, Play, GithubIcon, ArrowLeftRight } from 'lucide-react';
import { useFramework } from '../context/framework-context';
import { FlowEditor } from './flow-editor';
import { NodePalette } from './node-palette';
import { PropertyPanel } from './property-panel';
import { CodePanel } from './code-panel';
import { ExecutionPanel } from './execution-panel';
import { DeployPanel } from './deploy-panel';
import { InvokePanel } from './invoke-panel';
import { ProjectManagerComponent } from './project-manager';
import { ResizablePanel } from './resizable-panel';
import { type StrandsProject, ProjectManager } from '../lib/project-manager';
import { useCodeGenerator, useFlowValidator } from '../frameworks/hooks';
import type { ValidationIssue } from '../frameworks/types';
import { showToast, ToastRenderer } from './ui/simple-toast';
import { useUndoRedo } from '../lib/use-undo-redo';

// Auto-save key for localStorage (framework-namespaced)
function getAutosaveKey(frameworkId?: string): string {
  if (frameworkId === 'google-adk') return 'agent_studio_autosave_adk';
  return 'agent_studio_autosave_strands';
}

// Helper functions for auto-save
const saveFlowToAutoSave = (nodes: Node[], edges: Edge[], graphMode: boolean, frameworkId?: string) => {
  try {
    const flowData = { nodes, edges, graphMode, timestamp: Date.now() };
    localStorage.setItem(getAutosaveKey(frameworkId), JSON.stringify(flowData));
  } catch (error) {
    console.error('Failed to auto-save flow:', error);
  }
};

const loadFlowFromAutoSave = (frameworkId?: string): { nodes: Node[], edges: Edge[], graphMode?: boolean } | null => {
  try {
    const stored = localStorage.getItem(getAutosaveKey(frameworkId));
    if (!stored) return null;
    const flowData = JSON.parse(stored);
    return {
      nodes: flowData.nodes || [],
      edges: flowData.edges || [],
      graphMode: flowData.graphMode || false
    };
  } catch (error) {
    console.error('Failed to load auto-saved flow:', error);
    return null;
  }
};

const clearAutoSavedFlow = (frameworkId?: string) => {
  localStorage.removeItem(getAutosaveKey(frameworkId));
};

export function MainLayout() {
  const { framework, exitToSelector } = useFramework();
  const generateCode = useCodeGenerator();
  const frameworkValidateFlow = useFlowValidator();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [graphMode, setGraphMode] = useState(false);
  const [showCodePanel, setShowCodePanel] = useState(true);
  const [rightPanelMode, setRightPanelMode] = useState<'code' | 'execution' | 'deploy' | 'invoke'>('code');
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [currentProject, setCurrentProject] = useState<StrandsProject | null>(null);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [showConfirmNewProject, setShowConfirmNewProject] = useState(false);

  // Undo/Redo system
  const { saveSnapshot, canUndo, canRedo } = useUndoRedo(nodes, edges, setNodes, setEdges);

  // Set framework on ProjectManager so it uses correct namespace
  useEffect(() => {
    if (framework?.id) {
      ProjectManager.setFramework(framework.id);
    }
    // One-time: migrate legacy localStorage projects
    ProjectManager.migrateFromLegacy();
    // Background sync unsynced projects to DB
    ProjectManager.syncPendingProjects();
  }, [framework?.id]);

  // Load current project on mount, or load auto-saved flow if no project
  useEffect(() => {
    const current = ProjectManager.getCurrentProject();
    if (current) {
      setCurrentProject(current);
      setNodes(current.nodes);
      setEdges(current.edges);
      setGraphMode(current.graphMode || false);
      setLastSaveTime(new Date(current.updatedAt));
      clearAutoSavedFlow(framework?.id);
    } else {
      // No current project, try to load auto-saved flow
      const autoSaved = loadFlowFromAutoSave(framework?.id);
      if (autoSaved) {
        setNodes(autoSaved.nodes);
        setEdges(autoSaved.edges);
        setGraphMode(autoSaved.graphMode || false);
      }
    }
  }, []);

  // Keep selectedNode synchronized with nodes array
  useEffect(() => {
    if (selectedNode) {
      const updatedNode = nodes.find(n => n.id === selectedNode.id);
      if (updatedNode && updatedNode !== selectedNode) {
        setSelectedNode(updatedNode);
      }
    }
  }, [nodes, selectedNode]);

  // Auto-save flow when nodes, edges, or graphMode change (only if no current project)
  useEffect(() => {
    if (!currentProject && (nodes.length > 0 || edges.length > 0)) {
      const timer = setTimeout(() => {
        saveFlowToAutoSave(nodes, edges, graphMode, framework?.id);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [nodes, edges, graphMode, currentProject, framework?.id]);

  // Listen for switch to execution panel event
  // Listen for switch to execution panel event
  useEffect(() => {
    const handleSwitchToExecution = () => {
      setRightPanelMode('execution');
      setShowCodePanel(true);
    };

    window.addEventListener('switchToExecution', handleSwitchToExecution);
    return () => {
      window.removeEventListener('switchToExecution', handleSwitchToExecution);
    };
  }, []);

  const handleNodeSelect = useCallback((node: Node | null) => {
    if (node) {
      // Always find the most up-to-date version of the node from the nodes array
      const currentNode = nodes.find(n => n.id === node.id) || node;
      setSelectedNode(currentNode);
    } else {
      setSelectedNode(null);
    }
  }, [nodes]);

  const handleNodesChange = useCallback((newNodes: Node[]) => {
    saveSnapshot();
    setNodes(newNodes);
    if (selectedNode && !newNodes.find(node => node.id === selectedNode.id)) {
      setSelectedNode(null);
    }
  }, [selectedNode, saveSnapshot]);

  const handleUpdateNode = useCallback((nodeId: string, data: any) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === nodeId) {
          // Merge new data with existing data instead of replacing it
          const updatedNode = { ...node, data: { ...node.data, ...data } };
          // Update selectedNode if it's the same node being updated
          if (selectedNode?.id === nodeId) {
            setSelectedNode(updatedNode);
          }
          return updatedNode;
        }
        return node;
      })
    );
  }, [selectedNode]);

  const handleClosePanel = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleEdgesChange = useCallback((newEdges: Edge[]) => {
    setEdges(newEdges);
  }, []);

  const handleLoadProject = useCallback((project: StrandsProject) => {
    setNodes(project.nodes);
    setEdges(project.edges);
    setGraphMode(project.graphMode || false);
    setCurrentProject(project);
    setLastSaveTime(new Date(project.updatedAt));
    clearAutoSavedFlow(framework?.id);

    // Trigger fit-to-view after nodes are rendered
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('fitViewRequested'));
    }, 100);
  }, [framework?.id]);

  // Project management functions
  const handleSaveCurrentProject = useCallback(() => {
    if (currentProject) {
      // Update existing project
      const updated = ProjectManager.updateProject(currentProject.id, {
        nodes,
        edges,
        graphMode,
      });
      if (updated) {
        setCurrentProject(updated);
        setLastSaveTime(new Date());
        showToast('Project saved', 'success');
      }
    } else {
      // Save as new project
      setShowNewProjectDialog(true);
    }
  }, [currentProject, nodes, edges, graphMode]);

  // Keyboard shortcuts (Ctrl+S to save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Call save directly — avoids stale closure issues
        if (currentProject) {
          const updated = ProjectManager.updateProject(currentProject.id, {
            nodes,
            edges,
            graphMode,
          });
          if (updated) {
            setCurrentProject(updated);
            setLastSaveTime(new Date());
            
          }
        } else {
          setShowNewProjectDialog(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProject, nodes, edges, graphMode]);

  const handleCreateNewProject = useCallback(() => {
    if (!newProjectName.trim()) {
      
      return;
    }

    const newProject = ProjectManager.saveProject({
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      nodes,
      edges,
      graphMode,
    });

    ProjectManager.setCurrentProject(newProject.id);
    setCurrentProject(newProject);
    setLastSaveTime(new Date()); // Set save timestamp for new project
    setNewProjectName('');
    setNewProjectDescription('');
    setShowNewProjectDialog(false);
    // Clear auto-save since we now have a saved project
    clearAutoSavedFlow(framework?.id);
  }, [newProjectName, newProjectDescription, nodes, edges, graphMode]);

  const handleNewProject = useCallback(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setShowConfirmNewProject(true);
      return;
    }
    // Empty canvas — no confirmation needed
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setGraphMode(false);
    setCurrentProject(null);
    setLastSaveTime(null);
    ProjectManager.clearCurrentProject();
    clearAutoSavedFlow(framework?.id);
    showToast('New project created', 'info');
  }, [nodes, edges]);

  const confirmNewProject = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setGraphMode(false);
    setCurrentProject(null);
    setLastSaveTime(null);
    ProjectManager.clearCurrentProject();
    clearAutoSavedFlow(framework?.id);
    setShowConfirmNewProject(false);
    showToast('New project created', 'info');
  }, []);

  const handleExportCurrentProject = useCallback(() => {
    if (currentProject) {
      const jsonData = ProjectManager.exportProject(currentProject);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [currentProject]);

  const handleImportProject = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const imported = ProjectManager.importProject(content);
      if (imported) {
        ProjectManager.setCurrentProject(imported.id);
        setCurrentProject(imported);
        setNodes(imported.nodes);
        setEdges(imported.edges);
        setGraphMode(imported.graphMode || false);
        setLastSaveTime(new Date(imported.updatedAt));
        clearAutoSavedFlow(framework?.id);
        
      } else {
        
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  }, []);

  // Generate current code for execution — uses active framework's code generator
  const getCurrentCode = useCallback(() => {
    return generateCode(nodes, edges, { graphMode });
  }, [nodes, edges, graphMode, generateCode]);

  // Navigate to a specific node (select it + open property panel)
  const handleNavigateToNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setNodes(nodes.map(n => ({ ...n, selected: n.id === nodeId })));
    }
  }, [nodes]);

  // Compute validation status per node — used to show colored indicators on canvas
  const nodeValidationMap = (() => {
    const issues = frameworkValidateFlow(nodes, edges);
    const map = new Map<string, 'error' | 'warning' | 'info'>();
    for (const issue of issues) {
      if (!issue.nodeId) continue;
      // Framework uses 'type', Strands validator uses 'severity'
      const severity = (issue as any).severity || (issue as any).type || 'info';
      const current = map.get(issue.nodeId);
      // Keep the worst severity
      if (!current || severity === 'error' || (severity === 'warning' && current === 'info')) {
        map.set(issue.nodeId, severity);
      }
    }
    return map;
  })();

  // Enrich nodes with validation status for the flow editor to render
  const enrichedNodes = nodes.map(node => {
    const validationStatus = nodeValidationMap.get(node.id);
    if (validationStatus && validationStatus !== (node.data as any)?._validationStatus) {
      return { ...node, data: { ...node.data, _validationStatus: validationStatus } };
    }
    if (!validationStatus && (node.data as any)?._validationStatus) {
      const { _validationStatus, ...rest } = node.data as any;
      return { ...node, data: rest };
    }
    return node;
  });

  return (
    <div className="h-screen w-screen flex bg-gray-50 overflow-hidden">
      {/* Node Palette Sidebar — fixed, scrollable internally */}
      <NodePalette className="w-72 flex-shrink-0 h-screen" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header — Compact, branded */}
        <header className="bg-white border-b border-gray-200 flex-shrink-0">
          {/* Top bar: Project + Actions */}
          <div className="flex items-center h-12 px-4 gap-4">
            {/* Framework Badge + Switch */}
            <button
              onClick={exitToSelector}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors group"
              title="Switch framework"
            >
              <ArrowLeftRight className="w-3 h-3 text-indigo-400 group-hover:text-indigo-600" />
              <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wide">
                {framework?.id === 'google-adk' ? 'ADK' : 'Strands'}
              </span>
            </button>

            {/* Project Name */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-200 min-w-0">
                <FolderOpen className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                  {currentProject ? currentProject.name : 'Untitled Project'}
                </span>
              </div>
              {lastSaveTime && (
                <span className="text-[10px] text-green-600 flex-shrink-0">
                  ✓ {lastSaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* File Actions — compact icon buttons with tooltips */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleSaveCurrentProject}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                title="Save project (Ctrl+S)"
              >
                <Save className="w-3.5 h-3.5" />
                Save
              </button>

              <button
                onClick={handleNewProject}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="New project"
                aria-label="Create new project"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowProjectManager(true)}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Open project"
                aria-label="Open existing project"
              >
                <FolderOpen className="w-4 h-4" />
              </button>

              <label
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Import flow (.json)"
                aria-label="Import project from JSON file"
                role="button"
                tabIndex={0}
              >
                <Upload className="w-4 h-4" />
                <input type="file" accept=".json" onChange={handleImportProject} className="hidden" aria-label="Select JSON file to import" />
              </label>

              <button
                onClick={handleExportCurrentProject}
                disabled={!currentProject}
                className={`p-1.5 rounded-md transition-colors ${
                  currentProject ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
                }`}
                title={currentProject ? "Export flow (.json)" : "Save project first to enable export"}
                aria-label="Export project as JSON"
                aria-disabled={!currentProject}
              >
                <Download className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-gray-200 mx-1" />

              <a
                href="https://github.com/arpitmca1992/StrandsAgentBuilder"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="GitHub — Star ⭐"
                aria-label="View project on GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Tab bar: Panel mode switcher — IDE-style tabs */}
          <div className="flex items-center h-9 px-2 border-t border-gray-200 bg-gray-100/80">
            <div className="flex items-center gap-px">
              <button
                onClick={() => { setRightPanelMode('code'); setShowCodePanel(true); }}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-all border-b-2 ${
                  showCodePanel && rightPanelMode === 'code'
                    ? 'bg-white text-blue-700 border-blue-500 shadow-sm rounded-t-md'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-200/60 rounded-t-md'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Code
              </button>

              <button
                onClick={() => { setRightPanelMode('execution'); setShowCodePanel(true); }}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-all border-b-2 ${
                  showCodePanel && rightPanelMode === 'execution'
                    ? 'bg-white text-green-700 border-green-500 shadow-sm rounded-t-md'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-200/60 rounded-t-md'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Execute
              </button>

              <button
                onClick={() => { setRightPanelMode('deploy'); setShowCodePanel(true); }}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-all border-b-2 ${
                  showCodePanel && rightPanelMode === 'deploy'
                    ? 'bg-white text-purple-700 border-purple-500 shadow-sm rounded-t-md'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-200/60 rounded-t-md'
                }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                Deploy
              </button>

              <button
                onClick={() => { setRightPanelMode('invoke'); setShowCodePanel(true); }}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium transition-all border-b-2 ${
                  showCodePanel && rightPanelMode === 'invoke'
                    ? 'bg-white text-cyan-700 border-cyan-500 shadow-sm rounded-t-md'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-200/60 rounded-t-md'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                Invoke
              </button>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Toggle panel visibility */}
            <button
              onClick={() => setShowCodePanel(!showCodePanel)}
              className={`p-1.5 rounded-md transition-colors ${
                showCodePanel
                  ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/60'
                  : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
              }`}
              title={showCodePanel ? 'Hide right panel' : 'Show right panel'}
              aria-label={showCodePanel ? 'Hide right panel' : 'Show right panel'}
            >
              {showCodePanel ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>
        
        {/* Flow Editor, Property Panel, and Code Panel */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <FlowEditor
            className="flex-1"
            onNodeSelect={handleNodeSelect}
            nodes={enrichedNodes}
            onNodesChange={handleNodesChange}
            edges={edges}
            onEdgesChange={handleEdgesChange}
            graphMode={graphMode}
            onGraphModeChange={setGraphMode}
          />
          
          {selectedNode && (
            <PropertyPanel
              className="w-80 flex-shrink-0 h-full overflow-hidden"
              selectedNode={selectedNode}
              onClose={handleClosePanel}
              onUpdateNode={handleUpdateNode}
              edges={edges}
              nodes={nodes}
            />
          )}
          
          {showCodePanel && (
            <ResizablePanel
              resizeFrom="left"
              defaultWidth={384}
              minWidth={300}
              maxWidth={800}
              storageKey="right-panel-width" // Shared storage key for both panels
            >
              {rightPanelMode === 'code' ? (
                <CodePanel
                  nodes={nodes}
                  edges={edges}
                  graphMode={graphMode}
                  onNavigateToNode={handleNavigateToNode}
                />
              ) : rightPanelMode === 'execution' ? (
                <ExecutionPanel
                  code={getCurrentCode()}
                  projectId={currentProject?.id || 'default-project'}
                  projectName={currentProject?.name || 'Untitled Project'}
                  projectVersion={currentProject?.version || '1.0.0'}
                  flowData={{ nodes, edges }}
                />
              ) : rightPanelMode === 'deploy' ? (
                <DeployPanel
                  nodes={nodes}
                  edges={edges}
                  graphMode={graphMode}
                />
              ) : (
                <InvokePanel />
              )}
            </ResizablePanel>
          )}
        </div>
      </div>

      {/* Project Manager Modal */}
      {showProjectManager && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <ProjectManagerComponent
            className="w-[420px] max-h-[500px] m-4 bg-white rounded-xl shadow-2xl border border-gray-200"
            onLoadProject={handleLoadProject}
            onClose={() => setShowProjectManager(false)}
          />
        </div>
      )}

      {/* New Project Dialog */}
      {showNewProjectDialog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-96 mx-4">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Create New Project</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowNewProjectDialog(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewProject}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      


      {/* Welcome Overlay (first-time users) */}

      {/* Toast Notifications */}
      <ToastRenderer />

      {/* Confirm New Project Modal */}
      {showConfirmNewProject && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-96 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">⚠️</span>
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900">Start New Project?</h4>
                <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Creating a new project will clear your current flow. All unsaved changes will be lost.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmNewProject(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmNewProject}
                className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-sm transition-colors"
              >
                Clear & Create New
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
