import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Send, X } from 'lucide-react';

export function OutputNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const label = (data as any)?.label || 'Output';
  const _validationStatus = (data as any)?._validationStatus as 'error' | 'warning' | 'info' | undefined;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const validationBorderClass = _validationStatus === 'error'
    ? 'border-red-400 ring-2 ring-red-100'
    : _validationStatus === 'warning'
    ? 'border-amber-400 ring-2 ring-amber-100'
    : '';

  return (
    <div className={`
      rounded-xl border-2 min-w-[140px] transition-all duration-150 relative
      ${selected
        ? 'border-red-500 shadow-xl ring-2 ring-red-200 bg-red-50'
        : validationBorderClass || 'border-red-300 hover:border-red-400 hover:shadow-md bg-gradient-to-br from-red-50 to-rose-50'}
    `}>
      {/* Validation badge */}
      {_validationStatus && !selected && (
        <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm z-10 ${
          _validationStatus === 'error' ? 'bg-red-500' : _validationStatus === 'warning' ? 'bg-amber-500' : 'bg-blue-400'
        }`}>
          {_validationStatus === 'error' ? '!' : _validationStatus === 'warning' ? '⚠' : 'i'}
        </div>
      )}
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!bg-red-500 !w-3.5 !h-3.5 !border-2 !border-white !absolute"
        style={{ top: -7, left: '50%' }}
      />

      <div className="px-4 py-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-red-100 border border-red-200 flex items-center justify-center">
          <Send className="w-3.5 h-3.5 text-red-600" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-semibold text-red-800">{label}</span>
          <p className="text-[10px] text-red-500">↑ Output</p>
        </div>
        {selected && (
          <button
            onClick={handleDelete}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 rounded transition-colors"
            title="Delete"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
