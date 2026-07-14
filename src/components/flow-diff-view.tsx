/**
 * Flow Version Diff — Compare two flow versions visually
 */

import { type Node, type Edge } from '@xyflow/react';
import { Plus, Minus, Edit3 } from 'lucide-react';

interface FlowVersion {
  nodes: Node[];
  edges: Edge[];
  timestamp?: string;
  label?: string;
}

interface DiffItem {
  type: 'added' | 'removed' | 'modified';
  entity: 'node' | 'edge';
  id: string;
  label?: string;
  details?: string;
}

export function computeFlowDiff(before: FlowVersion, after: FlowVersion): DiffItem[] {
  const diffs: DiffItem[] = [];

  const beforeNodeIds = new Set(before.nodes.map(n => n.id));
  const afterNodeIds = new Set(after.nodes.map(n => n.id));
  const beforeEdgeIds = new Set(before.edges.map(e => e.id));
  const afterEdgeIds = new Set(after.edges.map(e => e.id));

  // Added nodes
  after.nodes.forEach(n => {
    if (!beforeNodeIds.has(n.id)) {
      diffs.push({ type: 'added', entity: 'node', id: n.id, label: (n.data as any)?.label || n.type });
    }
  });

  // Removed nodes
  before.nodes.forEach(n => {
    if (!afterNodeIds.has(n.id)) {
      diffs.push({ type: 'removed', entity: 'node', id: n.id, label: (n.data as any)?.label || n.type });
    }
  });

  // Modified nodes
  before.nodes.forEach(bNode => {
    const aNode = after.nodes.find(n => n.id === bNode.id);
    if (aNode) {
      const bData = JSON.stringify(bNode.data);
      const aData = JSON.stringify(aNode.data);
      if (bData !== aData) {
        diffs.push({ type: 'modified', entity: 'node', id: bNode.id, label: (bNode.data as any)?.label || bNode.type, details: 'Configuration changed' });
      }
    }
  });

  // Added edges
  after.edges.forEach(e => {
    if (!beforeEdgeIds.has(e.id)) {
      diffs.push({ type: 'added', entity: 'edge', id: e.id, label: `${e.source} → ${e.target}` });
    }
  });

  // Removed edges
  before.edges.forEach(e => {
    if (!afterEdgeIds.has(e.id)) {
      diffs.push({ type: 'removed', entity: 'edge', id: e.id, label: `${e.source} → ${e.target}` });
    }
  });

  return diffs;
}

interface FlowDiffViewProps {
  diffs: DiffItem[];
  className?: string;
}

export function FlowDiffView({ diffs, className = '' }: FlowDiffViewProps) {
  if (diffs.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-4">No changes detected</p>;
  }

  const added = diffs.filter(d => d.type === 'added');
  const removed = diffs.filter(d => d.type === 'removed');
  const modified = diffs.filter(d => d.type === 'modified');

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3 text-[10px] text-gray-500">
        <span className="text-green-600">+{added.length} added</span>
        <span className="text-red-600">-{removed.length} removed</span>
        <span className="text-amber-600">~{modified.length} modified</span>
      </div>

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {diffs.map((diff, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${
              diff.type === 'added' ? 'bg-green-50 text-green-700' :
              diff.type === 'removed' ? 'bg-red-50 text-red-700' :
              'bg-amber-50 text-amber-700'
            }`}
          >
            {diff.type === 'added' && <Plus className="w-3 h-3" />}
            {diff.type === 'removed' && <Minus className="w-3 h-3" />}
            {diff.type === 'modified' && <Edit3 className="w-3 h-3" />}
            <span className="font-medium">{diff.entity}:</span>
            <span className="truncate">{diff.label || diff.id}</span>
            {diff.details && <span className="text-[9px] opacity-70 ml-auto">{diff.details}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
