/**
 * ADK MCP Tool Node
 * 
 * Represents MCPToolset in Google ADK — connects to MCP servers.
 */

import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Server, X } from 'lucide-react';

interface ADKMCPToolData {
  label?: string;
  serverName?: string;
  transport?: 'stdio' | 'sse' | 'streamable-http';
  command?: string;
  url?: string;
}

export function ADKMCPToolNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as ADKMCPToolData || {};
  const { label = 'MCP Toolset', serverName = '', transport = 'stdio' } = nodeData;

  return (
    <div
      className={`
        relative rounded-xl border-2 shadow-lg min-w-[180px] max-w-[220px]
        bg-gradient-to-br from-cyan-50 to-white
        ${selected ? 'border-cyan-500 ring-2 ring-cyan-200' : 'border-cyan-300'}
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

      <div className="px-3 py-2 border-b border-cyan-200 bg-cyan-100/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Server size={14} className="text-cyan-600" />
          <span className="text-xs font-semibold text-cyan-800 truncate">{label}</span>
        </div>
      </div>

      <div className="px-3 py-2 space-y-1">
        <div className="text-[10px] text-slate-500">
          <span className="font-medium text-slate-700">Server:</span> {serverName || 'unnamed'}
        </div>
        <div className="text-[10px] text-slate-500">
          <span className="font-medium text-slate-700">Transport:</span> {transport}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3 !h-3 !bg-cyan-400 !border-cyan-600"
        title="Connect to agent"
      />
    </div>
  );
}
