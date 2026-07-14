/**
 * useUndoRedo — Undo/Redo hook for canvas operations
 *
 * Stores snapshots of nodes + edges state. 
 * Ctrl+Z = undo, Ctrl+Shift+Z = redo.
 * Max 50 history entries to bound memory.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { type Node, type Edge } from '@xyflow/react';

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY = 50;

export function useUndoRedo(
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void
) {
  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);
  const skipRef = useRef(false);

  // Save current state to history (called before mutations)
  const saveSnapshot = useCallback(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    setPast(prev => {
      const newPast = [...prev, { nodes, edges }];
      if (newPast.length > MAX_HISTORY) newPast.shift();
      return newPast;
    });
    setFuture([]); // Clear redo stack on new action
  }, [nodes, edges]);

  // Undo
  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    setPast(newPast);
    setFuture(prev => [...prev, { nodes, edges }]);

    skipRef.current = true;
    setNodes(previous.nodes);
    setEdges(previous.edges);
  }, [past, nodes, edges, setNodes, setEdges]);

  // Redo
  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[future.length - 1];
    const newFuture = future.slice(0, -1);

    setFuture(newFuture);
    setPast(prev => [...prev, { nodes, edges }]);

    skipRef.current = true;
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [future, nodes, edges, setNodes, setEdges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    saveSnapshot,
  };
}
