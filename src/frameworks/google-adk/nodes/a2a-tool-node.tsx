/**
 * ADK A2A Tool Node
 * 
 * Represents an Agent-to-Agent (A2A) remote agent connection in Google ADK.
 * Uses the to_a2a() method to expose/connect remote agents.
 */

import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Globe, X } from 'lucide-react';

interface ADKA2AToolData {
  label?: string;
  agentUrl?: string;
  name?: string;
  description?: string;
}

export function ADKA2AToolNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as ADKA2AToolData || {};
  const { label = 'A2A Agent', agentUrl = '', name = '' } = nodeData;

  return (
    <div
      className={`
        relative rounded-xl border-2 shadow-lg min-w-[180px] max-w-[220px]
        bg-gradient-to-br from-pink-50 to-white
        ${selected ? 'border-pink-500 ring-2 ring-pink-200' : 'border-pink-300'}
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

      <div className="px-3 py-2 border-b border-pink-200 bg-pink-100/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-pink-600" />
          <span className="text-xs font-semibold text-pink-800 truncate">{label}</span>
        </div>
      </div>

      <div className="px-3 py-2 space-y-1">
        <div className="text-[10px] text-slate-500">
          <span className="font-medium text-slate-700">Name:</span> {name || 'remote_agent'}
        </div>
        {agentUrl && (
          <div className="text-[10px] text-slate-400 font-mono truncate" title={agentUrl}>
            {agentUrl}
          </div>
        )}
        <div className="text-[10px] text-pink-600 font-medium">
          🌐 Remote A2A endpoint
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="output" className="!w-3 !h-3 !bg-pink-400 !border-pink-600" title="Connect to agent" />
    </div>
  );
}
