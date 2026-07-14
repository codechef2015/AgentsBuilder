import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Cpu, X } from 'lucide-react';

interface FunctionNodeData {
  label?: string;
  functionCode?: string;
  description?: string;
  _validationStatus?: 'error' | 'warning' | 'info';
}

export function FunctionNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as FunctionNodeData || {};
  const {
    label = 'Function',
    functionCode = '',
    description = '',
    _validationStatus,
  } = nodeData;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  // Extract function name from code
  const funcName = functionCode
    ? (functionCode.match(/def\s+([a-zA-Z_]\w*)/)?.[1] || 'function')
    : 'undefined';

  const validationBorderClass = _validationStatus === 'error'
    ? 'border-red-400 ring-2 ring-red-100'
    : _validationStatus === 'warning'
    ? 'border-amber-400 ring-1 ring-amber-100'
    : '';

  return (
    <div className={`
      rounded-xl border-2 min-w-[180px] max-w-[220px] transition-all duration-150 relative
      ${selected
        ? 'border-teal-500 shadow-xl ring-2 ring-teal-200 bg-white'
        : validationBorderClass || 'border-teal-300 hover:border-teal-400 hover:shadow-md bg-gradient-to-br from-teal-50 to-cyan-50'}
    `}>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-3 py-2 border-b border-teal-100 rounded-t-[10px] flex items-center">
        <div className="w-5 h-5 rounded-md bg-teal-100 flex items-center justify-center mr-2">
          <Cpu className="w-3 h-3 text-teal-600" />
        </div>
        <span className="text-xs font-semibold text-teal-800 truncate flex-1">{label}</span>
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

      {/* Body */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-mono font-medium">
            def {funcName}()
          </span>
        </div>
        {description && (
          <p className="text-[9px] text-gray-400 italic truncate">{description}</p>
        )}
        {!functionCode && (
          <p className="text-[9px] text-red-400 italic">No function defined</p>
        )}
        <div className="mt-1.5">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
            No LLM — deterministic
          </span>
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!bg-teal-500 !w-3 !h-3 !border-2 !border-white !absolute"
        style={{ top: -6, left: '50%' }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!bg-teal-500 !w-3 !h-3 !border-2 !border-white !absolute"
        style={{ bottom: -6, left: '50%' }}
      />
    </div>
  );
}
