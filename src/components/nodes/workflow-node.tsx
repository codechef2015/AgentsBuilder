import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { GitBranch, Settings, X } from 'lucide-react';

interface WorkflowTask {
  taskId: string;
  description: string;
  systemPrompt?: string;
  dependencies?: string[];
  priority?: number;
}

interface WorkflowNodeData {
  label?: string;
  workflowId?: string;
  tasks?: WorkflowTask[];
}

export function WorkflowNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as WorkflowNodeData || {};
  const {
    label = 'Workflow',
    workflowId = '',
    tasks = [],
  } = nodeData;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div className={`
      bg-white rounded-lg border-2 shadow-sm min-w-[260px]
      ${selected ? 'border-amber-500 shadow-lg' : 'border-gray-200 hover:border-amber-300'}
    `}>
      {/* Node Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 border-b border-amber-200 rounded-t-lg flex items-center">
        <GitBranch className="w-4 h-4 text-amber-600 mr-2" />
        <span className="text-sm font-semibold text-amber-800">{label}</span>
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
          {workflowId && (
            <div>
              <span className="font-medium">ID:</span>{' '}
              <span className="text-amber-600 font-mono">{workflowId}</span>
            </div>
          )}
          <div>
            <span className="font-medium">Tasks:</span> {tasks.length}
          </div>
          {tasks.length > 0 && (
            <div className="mt-2 space-y-1">
              {tasks.slice(0, 4).map((task, i) => (
                <div
                  key={task.taskId || i}
                  className="bg-amber-50 rounded px-2 py-1 text-xs border border-amber-100"
                >
                  <div className="font-medium text-amber-700 truncate">
                    {task.taskId || `Task ${i + 1}`}
                  </div>
                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="text-gray-400 text-[10px]">
                      ← {task.dependencies.join(', ')}
                    </div>
                  )}
                </div>
              ))}
              {tasks.length > 4 && (
                <div className="text-gray-400 text-center">
                  +{tasks.length - 4} more tasks
                </div>
              )}
            </div>
          )}
          {tasks.length === 0 && (
            <div className="text-gray-400 italic text-center py-2">
              No tasks defined
            </div>
          )}
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!bg-amber-500 !w-3 !h-3 !absolute"
        style={{ top: -6, left: '50%' }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!bg-amber-500 !w-3 !h-3 !absolute"
        style={{ bottom: -6, left: '50%' }}
      />
    </div>
  );
}
