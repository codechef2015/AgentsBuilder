/**
 * ADK LLM Agent Node
 * 
 * Represents a google.adk.agents.LlmAgent — the primary reasoning agent in ADK.
 * Has tools input, sub-agent connections, and output.
 */

import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Bot, X, Sparkles } from 'lucide-react';

interface ADKLlmAgentData {
  label?: string;
  name?: string;
  model?: string;
  modelProvider?: string;
  instruction?: string;
  description?: string;
  outputKey?: string;
  // Callbacks
  beforeModelCallback?: boolean;
  afterModelCallback?: boolean;
  beforeToolCallback?: boolean;
  afterToolCallback?: boolean;
  // Config
  generateContentConfig?: boolean;
  // Sub-agents
  subAgents?: string[];
}

export function ADKLlmAgentNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as ADKLlmAgentData || {};
  const {
    label = 'LLM Agent',
    name = '',
    model = 'gemini-2.0-flash',
    instruction = '',
    beforeModelCallback = false,
    afterModelCallback = false,
    beforeToolCallback = false,
    afterToolCallback = false,
  } = nodeData;

  const hasCallbacks = beforeModelCallback || afterModelCallback || beforeToolCallback || afterToolCallback;

  return (
    <div
      className={`
        relative rounded-xl border-2 shadow-lg min-w-[200px] max-w-[260px]
        bg-gradient-to-br from-blue-50 to-white
        ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-300'}
        transition-all duration-200
      `}
    >
      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); deleteElements({ nodes: [{ id }] }); }}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity z-10 shadow-sm"
        title="Delete node"
      >
        <X size={10} />
      </button>

      {/* Header */}
      <div className="px-3 py-2 border-b border-blue-200 bg-blue-100/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-blue-600" />
          <span className="text-xs font-semibold text-blue-800 truncate">{label}</span>
          {hasCallbacks && <Sparkles size={10} className="text-amber-500" title="Callbacks configured" />}
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1">
        <div className="text-[10px] text-slate-500 flex items-center gap-1">
          <span className="font-medium text-slate-700">Name:</span>
          <span className="truncate">{name || 'unnamed'}</span>
        </div>
        <div className="text-[10px] text-slate-500 flex items-center gap-1">
          <span className="font-medium text-slate-700">Model:</span>
          <span className="truncate">{model}</span>
        </div>
        {instruction && (
          <div className="text-[10px] text-slate-400 italic truncate" title={instruction}>
            "{instruction.slice(0, 40)}..."
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="tools"
        className="!w-3 !h-3 !bg-green-400 !border-green-600"
        title="Tools input"
        style={{ top: '40%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!w-3 !h-3 !bg-slate-400 !border-slate-600"
        title="Input / Parent agent"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!w-3 !h-3 !bg-blue-400 !border-blue-600"
        title="Output"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="sub-agents"
        className="!w-3 !h-3 !bg-purple-400 !border-purple-600"
        title="Sub-agents"
        style={{ top: '60%' }}
      />
    </div>
  );
}
