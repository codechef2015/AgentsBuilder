/**
 * ADK Callbacks Configuration Panel
 * 
 * Configures before/after agent, model, and tool callbacks.
 */

import { Sparkles } from 'lucide-react';

interface ADKCallbacksConfigProps {
  data: Record<string, any>;
  onUpdate: (data: Record<string, any>) => void;
}

const CALLBACK_OPTIONS = [
  {
    key: 'beforeAgentCallback',
    label: 'Before Agent',
    description: 'Runs before agent starts. Return Content to skip agent execution.',
  },
  {
    key: 'afterAgentCallback',
    label: 'After Agent',
    description: 'Runs after agent finishes. Return Content to override output.',
  },
  {
    key: 'beforeModelCallback',
    label: 'Before Model',
    description: 'Runs before LLM call. Return LlmResponse to skip the call (guardrails).',
  },
  {
    key: 'afterModelCallback',
    label: 'After Model',
    description: 'Runs after LLM response. Return modified response to override.',
  },
  {
    key: 'beforeToolCallback',
    label: 'Before Tool',
    description: 'Runs before tool execution. Return dict to skip tool (policy enforcement).',
  },
  {
    key: 'afterToolCallback',
    label: 'After Tool',
    description: 'Runs after tool execution. Return modified result to override.',
  },
];

export function ADKCallbacksConfig({ data, onUpdate }: ADKCallbacksConfigProps) {
  const enabledCount = CALLBACK_OPTIONS.filter(c => data[c.key]).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-amber-500" />
        <span className="text-[11px] font-semibold text-slate-700">
          Callbacks {enabledCount > 0 && <span className="text-amber-600">({enabledCount} active)</span>}
        </span>
      </div>

      <p className="text-[10px] text-slate-400">
        Callbacks let you intercept and modify agent behavior at runtime. Use for guardrails, logging, content filtering, and policy enforcement.
      </p>

      <div className="space-y-2">
        {CALLBACK_OPTIONS.map((cb) => (
          <label
            key={cb.key}
            className="flex items-start gap-2 p-2 rounded-md border border-slate-100 hover:border-slate-200 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={!!data[cb.key]}
              onChange={(e) => onUpdate({ [cb.key]: e.target.checked })}
              className="mt-0.5 rounded border-slate-300"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-slate-700">{cb.label}</div>
              <div className="text-[10px] text-slate-400">{cb.description}</div>
            </div>
          </label>
        ))}
      </div>

      {enabledCount > 0 && (
        <div className="p-2 bg-amber-50 border border-amber-100 rounded-md">
          <p className="text-[10px] text-amber-700">
            ⚡ {enabledCount} callback{enabledCount > 1 ? 's' : ''} will be generated in the code. 
            Edit the generated functions to add your custom logic.
          </p>
        </div>
      )}
    </div>
  );
}
