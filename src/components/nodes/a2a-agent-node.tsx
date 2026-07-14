import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Globe, Settings, X } from 'lucide-react';

interface A2AAgentNodeData {
  label?: string;
  endpoint?: string;
  agentName?: string;
  description?: string;
  timeout?: number;
  streaming?: boolean;
}

export function A2AAgentNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as A2AAgentNodeData || {};
  const {
    label = 'A2A Agent',
    endpoint = '',
    agentName = '',
    timeout = 300,
    streaming = false,
  } = nodeData;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div className={`
      bg-white rounded-lg border-2 shadow-sm min-w-[240px]
      ${selected ? 'border-sky-500 shadow-lg' : 'border-gray-200 hover:border-sky-300'}
    `}>
      {/* Node Header */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-4 py-2 border-b border-sky-200 rounded-t-lg flex items-center">
        <Globe className="w-4 h-4 text-sky-600 mr-2" />
        <span className="text-sm font-semibold text-sky-800">{label}</span>
        <div className="ml-auto flex items-center space-x-1">
          <Settings className="w-3 h-3 text-gray-400" />
          {selected && (
            <button
              onClick={handleDelete}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Delete node"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Node Content */}
      <div className="p-4">
        <div className="space-y-2 text-xs text-gray-600">
          <div className="truncate max-w-[200px]">
            <span className="font-medium">Endpoint:</span>{' '}
            {endpoint ? (
              <span className="text-sky-600">{endpoint}</span>
            ) : (
              <span className="text-gray-400 italic">Not configured</span>
            )}
          </div>
          {agentName && (
            <div>
              <span className="font-medium">Name:</span> {agentName}
            </div>
          )}
          <div>
            <span className="font-medium">Timeout:</span> {timeout}s
          </div>
          {streaming && (
            <div className="text-sky-500 font-medium">⚡ Streaming</div>
          )}
        </div>
      </div>

      {/* Input Handle - can be used as a tool by orchestrator */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!bg-sky-500 !w-3 !h-3 !absolute"
        style={{ top: -6, left: '50%' }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!bg-sky-500 !w-3 !h-3 !absolute"
        style={{ bottom: -6, left: '50%' }}
      />
    </div>
  );
}
