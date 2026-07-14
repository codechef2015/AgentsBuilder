/**
 * ADK Built-in Tool Node
 * 
 * Represents ADK built-in tools: google_search, code_execution, etc.
 */

import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Wrench, X } from 'lucide-react';

interface ADKBuiltinToolData {
  label?: string;
  toolType?: 'google_search' | 'vertex_ai_search' | 'google_maps_grounding';
}

const BUILTIN_TOOLS = {
  google_search: { name: 'Google Search', import: 'from google.adk.tools import google_search' },
  vertex_ai_search: { name: 'Vertex AI Search', import: 'from google.adk.tools import vertex_ai_search' },
  google_maps_grounding: { name: 'Google Maps Grounding', import: 'from google.adk.tools import google_maps_grounding' },
};

export function ADKBuiltinToolNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as ADKBuiltinToolData || {};
  const { label = 'Built-in Tool', toolType = 'google_search' } = nodeData;
  const toolInfo = BUILTIN_TOOLS[toolType] || BUILTIN_TOOLS.google_search;

  return (
    <div
      className={`
        relative rounded-xl border-2 shadow-lg min-w-[180px] max-w-[220px]
        bg-gradient-to-br from-yellow-50 to-white
        ${selected ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-yellow-300'}
        transition-all duration-200
      `}
    >
      <button
        onClick={(e) => { e.stopPropagation(); deleteElements({ nodes: [{ id }] }); }}
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity z-10 shadow-sm"
        title="Delete node"
      >
        <X size={10} />
      </button>

      <div className="px-3 py-2 border-b border-yellow-200 bg-yellow-100/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Wrench size={14} className="text-yellow-600" />
          <span className="text-xs font-semibold text-yellow-800 truncate">{label}</span>
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="text-[10px] text-slate-600 font-medium">{toolInfo.name}</div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3 !h-3 !bg-yellow-400 !border-yellow-600"
        title="Connect to agent"
      />
    </div>
  );
}
