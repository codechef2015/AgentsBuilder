/**
 * Templates API Client — Fetches flow templates from backend MySQL
 */

const API_BASE = '/api/templates';

export interface TemplateListItem {
  template_id: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  is_official: boolean;
  use_count: number;
  source_author: string | null;
}

export interface TemplateDetail {
  template_id: string;
  name: string;
  description: string | null;
  category: string;
  pattern: string | null;
  difficulty: string;
  tags: string[] | null;
  flow_data: { nodes: any[]; edges: any[]; graphMode?: boolean };
  source_url: string | null;
  source_author: string | null;
  is_official: boolean;
  use_count: number;
}

/**
 * List all available templates (optionally filtered)
 */
export async function fetchTemplates(filters?: {
  category?: string;
  difficulty?: string;
  framework?: string;
}): Promise<TemplateListItem[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.difficulty) params.set('difficulty', filters.difficulty);
  if (filters?.framework) params.set('framework', filters.framework);

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return [];
  }
}

/**
 * Get a specific template with full flow data (for importing)
 */
export async function fetchTemplateDetail(templateId: string): Promise<TemplateDetail | null> {
  try {
    const response = await fetch(`${API_BASE}/${templateId}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch template ${templateId}:`, error);
    return null;
  }
}
