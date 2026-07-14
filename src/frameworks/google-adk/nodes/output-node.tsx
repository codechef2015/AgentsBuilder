/**
 * ADK Output Node
 */

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ArrowLeft } from 'lucide-react';

export function ADKOutputNode({ data, selected }: NodeProps) {
  const label = (data as any)?.label || 'Output';

  return (
    <div
      className={`
        rounded-xl border-2 shadow-md min-w-[140px]
        bg-gradient-to-br from-red-50 to-white
        ${selected ? 'border-red-500 ring-2 ring-red-200' : 'border-red-300'}
        px-3 py-2
      `}
    >
      <div className="flex items-center gap-2">
        <ArrowLeft size={14} className="text-red-600" />
        <span className="text-xs font-semibold text-red-800">{label}</span>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-red-400 !border-red-600"
      />
    </div>
  );
}
