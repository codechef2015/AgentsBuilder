/**
 * Framework Selector Page
 * 
 * Landing page where users choose between Strands Agents SDK or Google ADK.
 * Shows framework cards with descriptions, features, and version info.
 */

import { useFramework } from '../context/framework-context';
import { FrameworkRegistry } from '../frameworks/registry';
import type { FrameworkId } from '../frameworks/types';
import { ArrowRight, Zap, FlaskConical, FolderOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

// Icons for each framework
const frameworkIcons: Record<FrameworkId, typeof Zap> = {
  'strands': Zap,
  'google-adk': FlaskConical,
};

// Colors for each framework card
const frameworkColors: Record<FrameworkId, { border: string; bg: string; accent: string; badge: string }> = {
  'strands': {
    border: 'border-blue-500/30 hover:border-blue-400/60',
    bg: 'bg-gradient-to-br from-blue-950/40 to-slate-900/60',
    accent: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  'google-adk': {
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    bg: 'bg-gradient-to-br from-emerald-950/40 to-slate-900/60',
    accent: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300',
  },
};

// Recent projects from localStorage
interface RecentProject {
  name: string;
  framework: FrameworkId;
  updatedAt: string;
}

function getRecentProjects(): RecentProject[] {
  try {
    const stored = localStorage.getItem('agent_builder_recent_projects');
    if (stored) {
      return JSON.parse(stored).slice(0, 5);
    }
  } catch {
    // Ignore
  }
  return [];
}

export function FrameworkSelector() {
  const { selectFramework } = useFramework();
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const frameworks = FrameworkRegistry.getAll();

  useEffect(() => {
    setRecentProjects(getRecentProjects());
  }, []);

  const handleSelect = (id: FrameworkId) => {
    selectFramework(id);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center pt-12 p-8">
      {/* Logo — prominent at top */}
      <div className="mb-6">
        <img src="/logo.png" alt="AgenticBuilder" className="h-70 w-auto rounded-2xl" />
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">
          AgenticBuilder
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Choose your AI agent framework to get started. Build visually, generate code, deploy anywhere.
        </p>
      </div>

      {/* Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mb-12">
        {frameworks.map((fw) => {
          const Icon = frameworkIcons[fw.id] || Zap;
          const colors = frameworkColors[fw.id];

          return (
            <button
              key={fw.id}
              onClick={() => handleSelect(fw.id)}
              className={`
                group relative p-6 rounded-xl border-2 transition-all duration-300
                ${colors.border} ${colors.bg}
                hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/30
                text-left cursor-pointer
              `}
            >
              {/* Icon + Name */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-white/5 ${colors.accent}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{fw.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                    v{fw.version}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                {fw.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {fw.features.slice(0, 5).map((feature) => (
                  <span
                    key={feature}
                    className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/10"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Start button */}
              <div className={`flex items-center gap-2 ${colors.accent} font-medium text-sm group-hover:gap-3 transition-all`}>
                Start Building
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Recently Opened */}
      {recentProjects.length > 0 && (
        <div className="max-w-4xl w-full">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
            <FolderOpen size={14} />
            <span>Recently Opened</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {recentProjects.map((project, i) => {
              const colors = frameworkColors[project.framework];
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(project.framework)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-left"
                >
                  <div className="text-sm text-white">{project.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${colors?.badge || 'bg-slate-700 text-slate-300'}`}>
                      {project.framework === 'google-adk' ? 'ADK' : 'Strands'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-slate-600 text-xs">
        <p>Open source · MIT License · Visual agent builder for Strands SDK & Google ADK</p>
      </div>
    </div>
  );
}
