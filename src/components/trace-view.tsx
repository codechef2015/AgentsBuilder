/**
 * OTel Trace View — Visualize execution traces as a waterfall/timeline
 */

import { Clock, Cpu, Bot, Wrench } from 'lucide-react';

interface TraceSpan {
  id: string;
  name: string;
  type: 'agent' | 'tool' | 'model' | 'graph';
  startMs: number;
  durationMs: number;
  status: 'ok' | 'error';
  tokens?: { input: number; output: number };
  children?: TraceSpan[];
}

interface TraceViewProps {
  spans: TraceSpan[];
  totalDurationMs: number;
  className?: string;
}

function getSpanIcon(type: TraceSpan['type']) {
  switch (type) {
    case 'agent': return Bot;
    case 'tool': return Wrench;
    case 'model': return Cpu;
    case 'graph': return Clock;
  }
}

function getSpanColor(type: TraceSpan['type'], status: TraceSpan['status']) {
  if (status === 'error') return 'bg-red-400';
  switch (type) {
    case 'agent': return 'bg-blue-400';
    case 'tool': return 'bg-orange-400';
    case 'model': return 'bg-purple-400';
    case 'graph': return 'bg-indigo-400';
  }
}

export function TraceView({ spans, totalDurationMs, className = '' }: TraceViewProps) {
  if (spans.length === 0) {
    return (
      <div className={`p-4 text-center text-xs text-gray-400 ${className}`}>
        <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p>No trace data available</p>
        <p className="mt-1">Enable OTEL tracing in agent config to see execution traces</p>
      </div>
    );
  }

  return (
    <div className={`p-3 space-y-1 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-700">Execution Trace</span>
        <span className="text-[10px] text-gray-400">{totalDurationMs}ms total</span>
      </div>

      {/* Timeline ruler */}
      <div className="flex items-center gap-0 mb-2 px-24">
        <div className="flex-1 flex justify-between text-[8px] text-gray-400">
          <span>0ms</span>
          <span>{Math.round(totalDurationMs / 4)}ms</span>
          <span>{Math.round(totalDurationMs / 2)}ms</span>
          <span>{Math.round(totalDurationMs * 3 / 4)}ms</span>
          <span>{totalDurationMs}ms</span>
        </div>
      </div>

      {/* Spans */}
      {spans.map(span => {
        const Icon = getSpanIcon(span.type);
        const left = (span.startMs / totalDurationMs) * 100;
        const width = Math.max((span.durationMs / totalDurationMs) * 100, 1);

        return (
          <div key={span.id} className="flex items-center gap-2 group hover:bg-gray-50 rounded px-1 py-0.5">
            {/* Label */}
            <div className="w-20 flex items-center gap-1 flex-shrink-0">
              <Icon className="w-3 h-3 text-gray-400" />
              <span className="text-[9px] text-gray-600 truncate">{span.name}</span>
            </div>

            {/* Bar */}
            <div className="flex-1 h-4 bg-gray-100 rounded relative">
              <div
                className={`absolute top-0.5 bottom-0.5 rounded ${getSpanColor(span.type, span.status)}`}
                style={{ left: `${left}%`, width: `${width}%`, minWidth: '2px' }}
              />
            </div>

            {/* Duration */}
            <span className="text-[9px] text-gray-400 w-12 text-right flex-shrink-0">
              {span.durationMs}ms
            </span>

            {/* Tokens */}
            {span.tokens && (
              <span className="text-[8px] text-gray-300 w-16 text-right flex-shrink-0">
                {span.tokens.input + span.tokens.output} tok
              </span>
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-400" /><span className="text-[8px] text-gray-400">Agent</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-orange-400" /><span className="text-[8px] text-gray-400">Tool</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-purple-400" /><span className="text-[8px] text-gray-400">Model</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-red-400" /><span className="text-[8px] text-gray-400">Error</span></div>
      </div>
    </div>
  );
}
