/**
 * ADK Loop Agent Node
 * 
 * Represents google.adk.agents.LoopAgent — repeats sub-agents until escalation.
 */

import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { RefreshCw, X } from 'lucide-react';

interface ADKLoopAgentData {
  label?: string;
  name?: string;
  description?: string;
  maxIterations?: number;
}

export function ADKLoopAgentNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as ADKLoopAgentData || {};
  const { label = 'Loop Agent', name = '', maxIterations } = nodeData;

  return (
    <div
      className={`
        relative rounded-xl border-2 shadow-lg min-w-[190px] max-w-[240px]
        bg-gradient-to-br from-teal-50 to-white
        ${selected ? 'border-teal-500 ring-2 ring-teal-200' : 'border-teal-300'}
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
      <div className="px-3 py-2 border-b border-teal-200 bg-teal-100/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <RefreshCw size={14} className="text-teal-600" />
          <span className="text-xs font-semibold text-teal-800 truncate">{label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1">
        <div className="text-[10px] text-slate-500">
          <span className="font-medium text-slate-700">Name:</span> {name || 'unnamed'}
        </div>
        {maxIterations && (
          <div className="text-[10px] text-slate-500">
            <span className="font-medium text-slate-700">Max iterations:</span> {maxIterations}
          </div>
        )}
        <div className="text-[10px] text-teal-600 font-medium">
          ↻ Loops until agent escalates
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
        className="!w-3 !h-3 !bg-teal-400 !border-teal-600"
        title="Sub-agents (connect agents here)"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!w-3 !h-3 !bg-teal-400 !border-teal-600"
        title="Output"
      />
    </div>
  );
}
