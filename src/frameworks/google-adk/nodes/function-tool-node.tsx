/**
 * ADK Function Tool Node
 * 
 * Represents a FunctionTool in Google ADK — a Python function exposed as a tool.
 */

import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Code, X } from 'lucide-react';

interface ADKFunctionToolData {
  label?: string;
  functionName?: string;
  description?: string;
  code?: string;
}

export function ADKFunctionToolNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as ADKFunctionToolData || {};
  const { label = 'Function Tool', functionName = '', description = '' } = nodeData;

  return (
    <div
      className={`
        relative rounded-xl border-2 shadow-lg min-w-[180px] max-w-[220px]
        bg-gradient-to-br from-green-50 to-white
        ${selected ? 'border-green-500 ring-2 ring-green-200' : 'border-green-300'}
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

      <div className="px-3 py-2 border-b border-green-200 bg-green-100/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-green-600" />
          <span className="text-xs font-semibold text-green-800 truncate">{label}</span>
        </div>
      </div>

      <div className="px-3 py-2 space-y-1">
        <div className="text-[10px] text-slate-500">
          <span className="font-medium text-slate-700">fn:</span> {functionName || 'my_function'}
        </div>
        {description && (
          <div className="text-[10px] text-slate-400 italic truncate">{description}</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3 !h-3 !bg-green-400 !border-green-600"
        title="Connect to agent"
      />
    </div>
  );
}
