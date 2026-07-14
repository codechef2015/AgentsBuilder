import { useState, useEffect } from 'react';
import { FolderOpen, Download, Trash2, X, BookOpen, Layers, Star } from 'lucide-react';
import { ProjectManager, type StrandsProject } from '../lib/project-manager';
import { fetchTemplates, fetchTemplateDetail, type TemplateListItem } from '../lib/templates-client';
import { useFramework } from '../context/framework-context';
import { showToast } from './ui/simple-toast';

interface ProjectManagerComponentProps {
  onLoadProject: (project: StrandsProject) => void;
  onClose: () => void;
  className?: string;
}

export function ProjectManagerComponent({
  onLoadProject,
  onClose,
  className = ''
}: ProjectManagerComponentProps) {
  const { framework } = useFramework();
  const [projects, setProjects] = useState<StrandsProject[]>([]);
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [currentProject, setCurrentProject] = useState<StrandsProject | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'templates'>('templates');
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    loadProjects();
    loadTemplates();
    const current = ProjectManager.getCurrentProject();
    setCurrentProject(current);
  }, [framework?.id]);

  const loadProjects = () => {
    const allProjects = ProjectManager.getAllProjects();
    setProjects(allProjects);
  };

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    const result = await fetchTemplates({ framework: framework?.id });
    setTemplates(result);
    setLoadingTemplates(false);
  };

  const handleLoadProject = (project: StrandsProject) => {
    ProjectManager.setCurrentProject(project.id);
    setCurrentProject(project);
    onLoadProject(project);
    onClose();
  };

  const handleLoadTemplate = async (templateId: string) => {
    const detail = await fetchTemplateDetail(templateId);
    if (!detail || !detail.flow_data) {
      showToast('Failed to load template', 'error');
      return;
    }

    // Convert template to project format
    const project: StrandsProject = {
      id: `template_${templateId}_${Date.now()}`,
      name: detail.name,
      description: detail.description || '',
      nodes: detail.flow_data.nodes || [],
      edges: detail.flow_data.edges || [],
      graphMode: detail.flow_data.graphMode || false,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onLoadProject(project);
    onClose();
    showToast(`Template "${detail.name}" loaded`, 'success');
  };

  const handleDeleteProject = (projectId: string) => {
    ProjectManager.deleteProject(projectId);
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
    loadProjects();
    showToast('Project deleted', 'info');
  };

  const handleExportProject = (project: StrandsProject) => {
    const jsonData = ProjectManager.exportProject(project);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const categoryColors: Record<string, string> = {
    'single-agent': 'bg-blue-100 text-blue-700',
    'agents-as-tools': 'bg-purple-100 text-purple-700',
    'swarm': 'bg-emerald-100 text-emerald-700',
    'graph': 'bg-indigo-100 text-indigo-700',
    'a2a': 'bg-sky-100 text-sky-700',
    'workflow': 'bg-amber-100 text-amber-700',
  };

  const difficultyColors: Record<string, string> = {
    'beginner': 'bg-green-100 text-green-700',
    'intermediate': 'bg-yellow-100 text-yellow-700',
    'advanced': 'bg-red-100 text-red-700',
  };

  return (
    <div className={`flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900">Open Project</h3>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-5 flex-shrink-0">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'border-indigo-500 text-indigo-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'projects'
              ? 'border-blue-500 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          My Projects ({projects.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'templates' ? (
          /* Templates from MySQL */
          <div className="p-3">
            {loadingTemplates ? (
              <div className="text-center py-8 text-xs text-gray-400">Loading templates...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No templates available</p>
                <p className="text-[10px] text-gray-400 mt-1">Start the backend to load templates from database</p>
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.template_id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                    onClick={() => handleLoadTemplate(template.template_id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                            {template.name}
                          </span>
                          {template.is_official && (
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        {template.description && (
                          <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${categoryColors[template.category] || 'bg-gray-100 text-gray-600'}`}>
                            {template.category}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${difficultyColors[template.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                            {template.difficulty}
                          </span>
                          {template.source_author && (
                            <span className="text-[9px] text-gray-400">by {template.source_author}</span>
                          )}
                        </div>
                      </div>
                      <button className="text-[10px] text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-indigo-100 rounded">
                        Use →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Local Projects */
          <div className="p-3">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No saved projects yet</p>
                <p className="text-[10px] text-gray-400 mt-1">Save your current flow to see it here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div key={project.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {project.name}
                        </div>
                        {project.description && (
                          <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                            {project.description}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 mt-1">
                          {project.nodes.length} nodes • {project.edges.length} edges • {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleLoadProject(project)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                          title="Open"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExportProject(project)}
                          className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-100 rounded transition-colors"
                          title="Export"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
