/**
 * ADK Input Node
 */

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ArrowRight } from 'lucide-react';

export function ADKInputNode({ data, selected }: NodeProps) {
  const label = (data as any)?.label || 'Input';

  return (
    <div
      className={`
        rounded-xl border-2 shadow-md min-w-[140px]
        bg-gradient-to-br from-green-50 to-white
        ${selected ? 'border-green-500 ring-2 ring-green-200' : 'border-green-300'}
        px-3 py-2
      `}
    >
      <div className="flex items-center gap-2">
        <ArrowRight size={14} className="text-green-600" />
        <span className="text-xs font-semibold text-green-800">{label}</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-green-400 !border-green-600"
      />
    </div>
  );
}
