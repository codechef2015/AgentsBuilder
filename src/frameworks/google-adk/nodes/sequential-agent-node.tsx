/**
 * ADK Sequential Agent Node
 * 
 * Represents google.adk.agents.SequentialAgent — runs sub-agents one after another.
 */

import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { ListOrdered, X } from 'lucide-react';

interface ADKSequentialAgentData {
  label?: string;
  name?: string;
  description?: string;
  subAgentCount?: number;
}

export function ADKSequentialAgentNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as ADKSequentialAgentData || {};
  const { label = 'Sequential Agent', name = '', description = '' } = nodeData;

  return (
    <div
      className={`
        relative rounded-xl border-2 shadow-lg min-w-[190px] max-w-[240px]
        bg-gradient-to-br from-purple-50 to-white
        ${selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-300'}
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

      {/* Header */}
      <div className="px-3 py-2 border-b border-purple-200 bg-purple-100/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <ListOrdered size={14} className="text-purple-600" />
          <span className="text-xs font-semibold text-purple-800 truncate">{label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1">
        <div className="text-[10px] text-slate-500">
          <span className="font-medium text-slate-700">Name:</span> {name || 'unnamed'}
        </div>
        {description && (
          <div className="text-[10px] text-slate-400 italic truncate">{description}</div>
        )}
        <div className="text-[10px] text-purple-600 font-medium">
          ↓ Runs sub-agents sequentially
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!w-3 !h-3 !bg-slate-400 !border-slate-600"
        title="Input / Parent"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="sub-agents"
        className="!w-3 !h-3 !bg-purple-400 !border-purple-600"
        title="Sub-agents (connect agents here)"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!w-3 !h-3 !bg-purple-400 !border-purple-600"
        title="Output"
      />
    </div>
  );
}
