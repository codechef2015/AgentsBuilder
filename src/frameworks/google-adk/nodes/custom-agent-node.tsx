/**
 * ADK Custom Agent Node
 * 
 * Represents a custom BaseAgent implementation — user-defined orchestration logic.
 */

import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Cog, X } from 'lucide-react';

interface ADKCustomAgentData {
  label?: string;
  name?: string;
  description?: string;
  className?: string;
  code?: string;
}

export function ADKCustomAgentNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as ADKCustomAgentData || {};
  const { label = 'Custom Agent', name = '', description = '' } = nodeData;

  return (
    <div
      className={`
        relative rounded-xl border-2 shadow-lg min-w-[190px] max-w-[240px]
        bg-gradient-to-br from-slate-50 to-white
        ${selected ? 'border-slate-500 ring-2 ring-slate-200' : 'border-slate-300'}
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

      <div className="px-3 py-2 border-b border-slate-200 bg-slate-100/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Cog size={14} className="text-slate-600" />
          <span className="text-xs font-semibold text-slate-800 truncate">{label}</span>
        </div>
      </div>

      <div className="px-3 py-2 space-y-1">
        <div className="text-[10px] text-slate-500">
          <span className="font-medium text-slate-700">Name:</span> {name || 'unnamed'}
        </div>
        {description && (
          <div className="text-[10px] text-slate-400 italic truncate">{description}</div>
        )}
        <div className="text-[10px] text-slate-500 font-medium">
          ⚙️ Custom _run_async_impl
        </div>
      </div>

      <Handle type="target" position={Position.Top} id="input" className="!w-3 !h-3 !bg-slate-400 !border-slate-600" title="Input" />
      <Handle type="target" position={Position.Left} id="sub-agents" className="!w-3 !h-3 !bg-slate-400 !border-slate-600" title="Sub-agents" />
      <Handle type="source" position={Position.Bottom} id="output" className="!w-3 !h-3 !bg-slate-400 !border-slate-600" title="Output" />
    </div>
  );
}
