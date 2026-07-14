import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Wrench, Package, Code, X } from 'lucide-react';

interface ToolNodeData {
  label?: string;
  toolType?: 'built-in' | 'custom';
  toolName?: string;
  description?: string;
  parameters?: Record<string, any>;
}

/** Emoji/icon for known tools */
function getToolIcon(name: string): string {
  const icons: Record<string, string> = {
    calculator: '🧮',
    file_read: '📄',
    file_write: '✏️',
    shell: '💻',
    current_time: '🕐',
    http_request: '🌐',
    editor: '📝',
    retrieve: '🔍',
    mem0_memory: '🧠',
  };
  return icons[name] || '🔧';
}

export function ToolNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as ToolNodeData || {};
  const {
    label = 'Tool',
    toolType = 'built-in',
    toolName = 'calculator',
  } = nodeData;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const isBuiltIn = toolType === 'built-in';
  const _validationStatus = (data as any)?._validationStatus as 'error' | 'warning' | 'info' | undefined;

  const validationBorderClass = _validationStatus === 'error'
    ? 'border-red-400 ring-2 ring-red-100'
    : _validationStatus === 'warning'
    ? 'border-amber-400 ring-2 ring-amber-100'
    : '';

  return (
    <div className={`
      rounded-xl border-2 min-w-[150px] transition-all duration-150 relative
      ${selected
        ? 'border-orange-500 shadow-xl ring-2 ring-orange-200 bg-white'
        : validationBorderClass || 'border-gray-200 hover:border-orange-300 hover:shadow-md bg-white'}
    `}>
      {_validationStatus && !selected && (
        <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm z-10 ${
          _validationStatus === 'error' ? 'bg-red-500' : _validationStatus === 'warning' ? 'bg-amber-500' : 'bg-blue-400'
        }`}>
          {_validationStatus === 'error' ? '!' : _validationStatus === 'warning' ? '⚠' : 'i'}
        </div>
      )}
      <div className="px-3 py-2.5 flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
          isBuiltIn ? 'bg-orange-50 border border-orange-200' : 'bg-purple-50 border border-purple-200'
        }`}>
          {isBuiltIn ? getToolIcon(toolName) : <Code className="w-4 h-4 text-purple-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-800 truncate">{label}</div>
          <div className="text-[10px] text-gray-400 font-mono truncate">{toolName}</div>
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

      {/* Output Handle (connects to agent's tool input) */}
      <Handle
        type="source"
        position={Position.Right}
        id="tool-output"
        className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white !absolute"
        style={{ right: -6, top: '50%' }}
      />
    </div>
  );
}
