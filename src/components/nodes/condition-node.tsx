import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { GitFork, X } from 'lucide-react';

interface ConditionNodeData {
  label?: string;
  conditionType?: 'output_contains' | 'status_check' | 'custom_python';
  conditionValue?: string;
  customCode?: string;
  _validationStatus?: 'error' | 'warning' | 'info';
}

export function ConditionNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as ConditionNodeData || {};
  const {
    label = 'Condition',
    conditionType = 'output_contains',
    conditionValue = '',
    customCode = '',
    _validationStatus,
  } = nodeData;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  // Display the condition logic
  const conditionPreview = conditionType === 'output_contains'
    ? conditionValue ? `Contains: "${conditionValue.slice(0, 20)}${conditionValue.length > 20 ? '…' : ''}"` : 'No condition set'
    : conditionType === 'status_check'
    ? 'Status == COMPLETED'
    : customCode ? 'Custom Python' : 'No code';

  const validationBorderClass = _validationStatus === 'error'
    ? 'border-red-400 ring-2 ring-red-100'
    : _validationStatus === 'warning'
    ? 'border-amber-400 ring-1 ring-amber-100'
    : '';

  return (
    <div className={`
      relative min-w-[160px] max-w-[200px] transition-all duration-150
      ${selected ? 'scale-105' : ''}
    `}>
      {/* Diamond shape via rotated square */}
      <div className={`
        w-32 h-32 mx-auto rotate-45 border-2 bg-white shadow-sm flex items-center justify-center
        ${selected ? 'border-yellow-500 shadow-xl ring-2 ring-yellow-200' : validationBorderClass || 'border-yellow-400 hover:border-yellow-500 hover:shadow-md'}
      `}>
        <div className="-rotate-45 text-center px-2">
          <GitFork className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
          <span className="text-[9px] font-semibold text-gray-800 block">{label}</span>
          <span className="text-[8px] text-gray-500 block mt-0.5">{conditionPreview}</span>
        </div>
      </div>

      {selected && (
        <button
          onClick={handleDelete}
          className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full bg-white shadow transition-colors z-10"
          title="Delete"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Input Handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!bg-yellow-500 !w-3 !h-3 !border-2 !border-white !absolute"
        style={{ top: -6, left: '50%' }}
      />

      {/* True Handle (right) — condition passes */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-white !absolute"
        style={{ right: -6, top: '50%' }}
      />

      {/* False Handle (bottom) — condition fails */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-white !absolute"
        style={{ bottom: -6, left: '50%' }}
      />
    </div>
  );
}
