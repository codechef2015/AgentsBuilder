import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type ReactFlowInstance,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import {
  Network, Search, Bot, Wrench, Server, ArrowRight,
  ArrowLeft, Code, Crown, Users, Globe, GitBranch,
  Keyboard, ZoomIn, ZoomOut, Maximize2, Trash2, X
} from 'lucide-react';

// Framework-aware imports
import { useFrameworkNodeTypes, useNodeDefaults, useMiniMapColors, useEdgeLabeler } from '../frameworks/hooks';
import { useFramework } from '../context/framework-context';

// Strands node imports (used as fallback when no framework context)
import {
  AgentNode,
  OrchestratorAgentNode,
  SwarmNode,
  ToolNode,
  InputNode,
  OutputNode,
  CustomToolNode,
  A2AAgentNode,
  WorkflowNode,
  FunctionNode,
  ConditionNode,
} from './nodes';
import { MCPToolNode } from './nodes/mcp-tool-node';
import { isValidConnection } from '../lib/connection-validator';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Fallback node types (used when framework context isn't available)
const fallbackNodeTypes = {
  agent: AgentNode,
  'orchestrator-agent': OrchestratorAgentNode,
  swarm: SwarmNode,
  tool: ToolNode,
  'mcp-tool': MCPToolNode,
  input: InputNode,
  output: OutputNode,
  'custom-tool': CustomToolNode,
  'a2a-agent': A2AAgentNode,
  workflow: WorkflowNode,
  'function-node': FunctionNode,
  'condition-node': ConditionNode,
};

/** MiniMap node color — delegates to framework hook inside component */

/** Quick-add node items for the floating toolbar — Strands */
const strandsQuickAddItems = [
  { type: 'agent', icon: Bot, label: 'Agent', color: 'text-blue-600' },
  { type: 'input', icon: ArrowRight, label: 'Input', color: 'text-green-600' },
  { type: 'output', icon: ArrowLeft, label: 'Output', color: 'text-red-600' },
  { type: 'tool', icon: Wrench, label: 'Tool', color: 'text-gray-600' },
  { type: 'mcp-tool', icon: Server, label: 'MCP', color: 'text-indigo-600' },
  { type: 'custom-tool', icon: Code, label: 'Custom', color: 'text-pink-600' },
];

/** Quick-add node items for the floating toolbar — ADK */
const adkQuickAddItems = [
  { type: 'adk-llm-agent', icon: Bot, label: 'Agent', color: 'text-blue-600' },
  { type: 'adk-input', icon: ArrowRight, label: 'Input', color: 'text-green-600' },
  { type: 'adk-output', icon: ArrowLeft, label: 'Output', color: 'text-red-600' },
  { type: 'adk-function-tool', icon: Code, label: 'Tool', color: 'text-green-600' },
  { type: 'adk-mcp-tool', icon: Server, label: 'MCP', color: 'text-cyan-600' },
  { type: 'adk-sequential', icon: Crown, label: 'Seq', color: 'text-purple-600' },
];

interface FlowEditorProps {
  className?: string;
  onNodeSelect?: (node: Node | null) => void;
  nodes?: Node[];
  onNodesChange?: (nodes: Node[]) => void;
  edges?: Edge[];
  onEdgesChange?: (edges: Edge[]) => void;
  graphMode?: boolean;
  onGraphModeChange?: (enabled: boolean) => void;
}

export function FlowEditor({
  className = '',
  onNodeSelect,
  nodes: externalNodes,
  onNodesChange: externalOnNodesChange,
  edges: externalEdges,
  onEdgesChange: externalOnEdgesChange,
  graphMode = false,
  onGraphModeChange
}: FlowEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Framework-aware hooks — provides dynamic node types, defaults, and colors
  const frameworkNodeTypes = useFrameworkNodeTypes();
  const getDefaultNodeData = useNodeDefaults();
  const getMiniMapNodeColor = useMiniMapColors();
  const getEdgeLabel = useEdgeLabeler();
  const { framework } = useFramework();

  // Select quick-add items based on active framework
  const quickAddItems = framework?.id === 'google-adk' ? adkQuickAddItems : strandsQuickAddItems;

  // Merge framework node types with fallback (framework types take priority)
  // CRITICAL: nodeTypes must be a stable reference for React Flow performance
  const nodeTypes = useMemo(() => {
    if (framework?.id === 'google-adk') {
      return { ...fallbackNodeTypes, ...frameworkNodeTypes };
    }
    // Strands or no framework — use fallback (which IS the Strands nodes)
    return fallbackNodeTypes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framework?.id]);

  const [internalNodes, setInternalNodes, onInternalNodesChange]: [Node[], (nodes: Node[]) => void, OnNodesChange] = useNodesState(initialNodes);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragNodeType, setDragNodeType] = useState<string | null>(null);

  // Use external nodes if provided, otherwise use internal state
  const nodes = externalNodes || internalNodes;
  const setNodes = externalOnNodesChange || setInternalNodes;
  const onNodesChange = externalOnNodesChange ? 
    (changes: any) => {
      const removedNodeIds = changes
        .filter((change: any) => change.type === 'remove')
        .map((change: any) => change.id);
      
      const updatedNodes = nodes.map((node) => {
        const change = changes.find((c: any) => c.id === node.id);
        if (!change) return node;
        switch (change.type) {
          case 'position':
            return { ...node, position: change.position };
          case 'select':
            return { ...node, selected: change.selected };
          case 'remove':
            return null;
          default:
            return node;
        }
      }).filter(Boolean);
      
      externalOnNodesChange(updatedNodes as Node[]);
      
      if (removedNodeIds.length > 0 && externalOnEdgesChange) {
        const updatedEdges = edges.filter(edge => 
          !removedNodeIds.includes(edge.source) && !removedNodeIds.includes(edge.target)
        );
        externalOnEdgesChange(updatedEdges);
      }
    } : 
    onInternalNodesChange;
  
  const [internalEdges, setInternalEdges, onInternalEdgesChange]: [Edge[], (edges: Edge[]) => void, OnEdgesChange] = useEdgesState(initialEdges);
  
  const edges = externalEdges || internalEdges;
  const setEdges = externalOnEdgesChange || setInternalEdges;
  const onEdgesChange = externalOnEdgesChange ? 
    (changes: any) => {
      const updatedEdges = edges.map((edge) => {
        const change = changes.find((c: any) => c.id === edge.id);
        if (!change) return edge;
        switch (change.type) {
          case 'remove':
            return null;
          case 'select':
            return { ...edge, selected: change.selected };
          default:
            return edge;
        }
      }).filter(Boolean);
      externalOnEdgesChange(updatedEdges as Edge[]);
    } : 
    onInternalEdgesChange;

  const [reactFlowInstance, setReactFlowInstance] = React.useState<ReactFlowInstance | null>(null);

  // Listen for fit-to-view requests (triggered when templates/projects are loaded)
  React.useEffect(() => {
    const handleFitView = () => {
      if (reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.15, duration: 300 });
        }, 50);
      }
    };

    window.addEventListener('fitViewRequested', handleFitView);
    return () => window.removeEventListener('fitViewRequested', handleFitView);
  }, [reactFlowInstance]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      // Use framework-specific validation if available, fallback to Strands validator
      let isValid = true;
      let errorMessage = '';

      if (framework?.id === 'google-adk') {
        // ADK validation via adapter
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);
        if (sourceNode && targetNode) {
          isValid = framework.validateConnection(sourceNode, targetNode, params.sourceHandle, params.targetHandle);
          if (!isValid) errorMessage = 'Invalid connection for this node type';
        }
      } else {
        // Strands validation (existing)
        const validation = isValidConnection(params, nodes, edges, graphMode);
        isValid = validation.valid;
        errorMessage = validation.message || 'Invalid connection';
      }

      if (isValid) {
        // Use framework adapter for edge labels
        let edgeLabel: string | undefined;
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);

        if (sourceNode && targetNode) {
          edgeLabel = getEdgeLabel(sourceNode, targetNode, params.sourceHandle) || undefined;
        }

        // Fallback for graph mode dependency edges
        if (!edgeLabel && graphMode && params.sourceHandle === 'output' &&
          (params.targetHandle === 'user-input' || params.targetHandle === 'input')) {
          edgeLabel = 'depends';
        }

        setEdges(addEdge({
          ...params,
          animated: true,
          label: edgeLabel || undefined,
          labelStyle: edgeLabel ? { fontSize: 9, fontWeight: 600, fill: '#6366f1' } : undefined,
          labelBgStyle: edgeLabel ? { fill: '#eef2ff', stroke: '#c7d2fe', strokeWidth: 1, rx: 4, ry: 4 } : undefined,
          labelBgPadding: edgeLabel ? [4, 2] as [number, number] : undefined,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }, edges));
        setConnectionError(null);
      } else {
        setConnectionError(errorMessage || 'Invalid connection');
        setTimeout(() => setConnectionError(null), 3000);
      }
    },
    [setEdges, nodes, edges, graphMode, framework, getEdgeLabel]
  );

  const isValidConnectionCallback = useCallback(
    (connection: Connection) => {
      if (framework?.id === 'google-adk') {
        const sourceNode = nodes.find(n => n.id === connection.source);
        const targetNode = nodes.find(n => n.id === connection.target);
        if (sourceNode && targetNode) {
          return framework.validateConnection(sourceNode, targetNode, connection.sourceHandle, connection.targetHandle);
        }
        return true;
      }
      const validation = isValidConnection(connection, nodes, edges, graphMode);
      return validation.valid;
    },
    [nodes, edges, graphMode, framework]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null);
    setShowLayoutMenu(false);
  }, [onNodeSelect]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    // Try to read the type from the data transfer (available in dragover on some browsers)
    const types = event.dataTransfer.types;
    if (types.includes('application/reactflow')) {
      setDragNodeType('node'); // generic indicator
    }
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
    setDragNodeType(null);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);
      setDragNodeType(null);

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      // screenToFlowPosition takes raw screen coordinates (clientX/clientY)
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Snap to grid (20px grid)
      const snappedPosition = {
        x: Math.round(position.x / 20) * 20,
        y: Math.round(position.y / 20) * 20,
      };

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type,
        position: snappedPosition,
        data: getDefaultNodeData(type),
      };

      setNodes([...nodes, newNode]);

      // Auto-select the new node for immediate configuration
      onNodeSelect?.(newNode);
    },
    [reactFlowInstance, setNodes, nodes, onNodeSelect]
  );

  /** Quick-add a node at the center of the current viewport */
  const handleQuickAdd = useCallback((type: string) => {
    if (!reactFlowInstance) return;

    const { x, y, zoom } = reactFlowInstance.getViewport();
    const centerX = (-x + (reactFlowWrapper.current?.clientWidth || 800) / 2) / zoom;
    const centerY = (-y + (reactFlowWrapper.current?.clientHeight || 600) / 2) / zoom;

    // Offset slightly to avoid stacking
    const offset = nodes.length * 20;

    const newNode: Node = {
      id: `${type}_${Date.now()}`,
      type,
      position: { x: centerX + offset, y: centerY + offset },
      data: getDefaultNodeData(type),
    };

    setNodes([...nodes, newNode]);
  }, [reactFlowInstance, setNodes, nodes]);

  /** Delete all selected nodes */
  const handleDeleteSelected = useCallback(() => {
    const selectedIds = nodes.filter(n => n.selected).map(n => n.id);
    if (selectedIds.length === 0) return;
    setNodes(nodes.filter(n => !n.selected));
    if (externalOnEdgesChange) {
      externalOnEdgesChange(edges.filter(e => !selectedIds.includes(e.source) && !selectedIds.includes(e.target)));
    }
  }, [nodes, edges, setNodes, externalOnEdgesChange]);

  /** Layout strategies */
  type LayoutType = 'horizontal' | 'vertical' | 'radial' | 'grid' | 'random';

  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  /** Compute topological order based on edges (respects flow direction) */
  const computeNodeLayers = useCallback(() => {
    // Build adjacency: source → targets
    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, string[]>();
    const nodeMap = new Map<string, Node>();

    nodes.forEach(n => {
      nodeMap.set(n.id, n);
      outgoing.set(n.id, []);
      incoming.set(n.id, []);
    });

    edges.forEach(e => {
      if (nodeMap.has(e.source) && nodeMap.has(e.target)) {
        outgoing.get(e.source)!.push(e.target);
        incoming.get(e.target)!.push(e.source);
      }
    });

    // Topological sort using Kahn's algorithm (BFS)
    const inDegree = new Map<string, number>();
    nodes.forEach(n => inDegree.set(n.id, incoming.get(n.id)!.length));

    const queue: string[] = [];
    inDegree.forEach((deg, id) => { if (deg === 0) queue.push(id); });

    const layerAssignment = new Map<string, number>();
    let layer = 0;

    while (queue.length > 0) {
      const currentBatch = [...queue];
      queue.length = 0;

      currentBatch.forEach(id => {
        layerAssignment.set(id, layer);
        outgoing.get(id)!.forEach(target => {
          inDegree.set(target, inDegree.get(target)! - 1);
          if (inDegree.get(target) === 0) {
            queue.push(target);
          }
        });
      });
      layer++;
    }

    // Assign disconnected nodes to layer based on type
    nodes.forEach(n => {
      if (!layerAssignment.has(n.id)) {
        if (n.type === 'input') layerAssignment.set(n.id, 0);
        else if (n.type === 'output') layerAssignment.set(n.id, layer);
        else if (n.type === 'tool' || n.type === 'custom-tool' || n.type === 'mcp-tool') layerAssignment.set(n.id, 1);
        else layerAssignment.set(n.id, Math.floor(layer / 2));
      }
    });

    // Group nodes by layer
    const layers = new Map<number, Node[]>();
    nodes.forEach(n => {
      const l = layerAssignment.get(n.id) || 0;
      if (!layers.has(l)) layers.set(l, []);
      layers.get(l)!.push(n);
    });

    return { layers, maxLayer: layer };
  }, [nodes, edges]);

  /** Apply layout and fit view */
  const applyLayout = useCallback((positions: Map<string, { x: number; y: number }>) => {
    setNodes(nodes.map(node => {
      const pos = positions.get(node.id);
      return pos ? { ...node, position: pos } : node;
    }));
    setTimeout(() => reactFlowInstance?.fitView({ padding: 0.2, duration: 300 }), 50);
    setShowLayoutMenu(false);
  }, [nodes, setNodes, reactFlowInstance]);

  /** Horizontal layout: Respects edge direction (left → right) */
  const layoutHorizontal = useCallback(() => {
    if (nodes.length === 0) return;
    const { layers } = computeNodeLayers();
    const H_GAP = 350, V_GAP = 150, START_X = 80, START_Y = 80;
    const positions = new Map<string, { x: number; y: number }>();

    const sortedLayers = [...layers.entries()].sort((a, b) => a[0] - b[0]);
    sortedLayers.forEach(([layerIdx, layerNodes]) => {
      // Center nodes vertically within each layer
      const totalHeight = (layerNodes.length - 1) * V_GAP;
      const offsetY = START_Y + (400 - totalHeight) / 2; // Center around 400px
      layerNodes.forEach((n, i) => {
        positions.set(n.id, { x: START_X + layerIdx * H_GAP, y: offsetY + i * V_GAP });
      });
    });

    applyLayout(positions);
  }, [nodes, computeNodeLayers, applyLayout]);

  /** Vertical layout: Respects edge direction (top → bottom) */
  const layoutVertical = useCallback(() => {
    if (nodes.length === 0) return;
    const { layers } = computeNodeLayers();
    const H_GAP = 280, V_GAP = 200, START_X = 80, START_Y = 60;
    const positions = new Map<string, { x: number; y: number }>();

    const sortedLayers = [...layers.entries()].sort((a, b) => a[0] - b[0]);
    sortedLayers.forEach(([layerIdx, layerNodes]) => {
      const totalWidth = (layerNodes.length - 1) * H_GAP;
      const offsetX = START_X + (600 - totalWidth) / 2;
      layerNodes.forEach((n, i) => {
        positions.set(n.id, { x: offsetX + i * H_GAP, y: START_Y + layerIdx * V_GAP });
      });
    });

    applyLayout(positions);
  }, [nodes, computeNodeLayers, applyLayout]);

  /** Radial layout: Respects direction — sources closer to center */
  const layoutRadial = useCallback(() => {
    if (nodes.length === 0) return;
    const { layers } = computeNodeLayers();
    const CENTER_X = 450, CENTER_Y = 350;
    const RING_GAP = 200;
    const positions = new Map<string, { x: number; y: number }>();

    const sortedLayers = [...layers.entries()].sort((a, b) => a[0] - b[0]);
    sortedLayers.forEach(([layerIdx, layerNodes]) => {
      if (layerIdx === 0 && layerNodes.length <= 2) {
        // First layer (inputs) at center
        layerNodes.forEach((n, i) => {
          positions.set(n.id, { x: CENTER_X + i * 80 - (layerNodes.length - 1) * 40, y: CENTER_Y + i * 40 - (layerNodes.length - 1) * 20 });
        });
      } else {
        // Other layers in concentric rings
        const radius = RING_GAP * layerIdx;
        layerNodes.forEach((n, i) => {
          const angle = (i / layerNodes.length) * Math.PI * 2 - Math.PI / 2;
          positions.set(n.id, {
            x: CENTER_X + Math.cos(angle) * radius,
            y: CENTER_Y + Math.sin(angle) * radius,
          });
        });
      }
    });

    applyLayout(positions);
  }, [nodes, computeNodeLayers, applyLayout]);

  /** Grid layout: Ordered by topological layer, then within layer */
  const layoutGrid = useCallback(() => {
    if (nodes.length === 0) return;
    const { layers } = computeNodeLayers();
    const CELL_W = 300, CELL_H = 200, START = 60;
    const positions = new Map<string, { x: number; y: number }>();

    // Flatten in topological order
    const sortedLayers = [...layers.entries()].sort((a, b) => a[0] - b[0]);
    const orderedNodes: Node[] = [];
    sortedLayers.forEach(([, layerNodes]) => orderedNodes.push(...layerNodes));

    const cols = Math.ceil(Math.sqrt(orderedNodes.length));
    orderedNodes.forEach((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions.set(node.id, { x: START + col * CELL_W, y: START + row * CELL_H });
    });

    applyLayout(positions);
  }, [nodes, computeNodeLayers, applyLayout]);

  /** Random layout: Respects flow direction — sources always left/above targets */
  const layoutRandom = useCallback(() => {
    if (nodes.length === 0) return;
    const { layers } = computeNodeLayers();
    const positions = new Map<string, { x: number; y: number }>();

    const sortedLayers = [...layers.entries()].sort((a, b) => a[0] - b[0]);
    const LAYER_WIDTH = 300;

    sortedLayers.forEach(([layerIdx, layerNodes]) => {
      // Random position WITHIN the layer's horizontal band (preserves direction)
      const baseX = 80 + layerIdx * LAYER_WIDTH;
      layerNodes.forEach((n) => {
        positions.set(n.id, {
          x: baseX + Math.random() * (LAYER_WIDTH * 0.6),
          y: 80 + Math.random() * 500,
        });
      });
    });

    applyLayout(positions);
  }, [nodes, computeNodeLayers, applyLayout]);

  /** Execute a layout by type */
  const handleLayout = useCallback((type: LayoutType) => {
    switch (type) {
      case 'horizontal': layoutHorizontal(); break;
      case 'vertical': layoutVertical(); break;
      case 'radial': layoutRadial(); break;
      case 'grid': layoutGrid(); break;
      case 'random': layoutRandom(); break;
    }
  }, [layoutHorizontal, layoutVertical, layoutRadial, layoutGrid, layoutRandom]);

  /** Fit all nodes into view */
  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.2, duration: 300 });
  }, [reactFlowInstance]);

  return (
    <div className={`h-full w-full ${className} relative`} ref={reactFlowWrapper}>
      {/* Drop Zone Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          <div className="absolute inset-2 border-2 border-dashed border-indigo-400 rounded-2xl bg-indigo-50/20 flex items-center justify-center transition-all duration-200">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border border-indigo-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-800">Drop here to add node</p>
                <p className="text-[10px] text-indigo-500">Snaps to grid automatically</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Error Toast */}
      {connectionError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
            <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-900" onClick={() => setConnectionError(null)} />
            {connectionError}
          </div>
        </div>
      )}

      {/* Top Toolbar — Layout, Fit View, Graph Mode */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {/* Layout tools */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 flex items-center divide-x divide-gray-200 relative">
          <button
            onClick={() => setShowLayoutMenu(!showLayoutMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-l-lg transition-colors"
            title="Choose layout arrangement"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            Layout ▾
          </button>
          <button
            onClick={handleFitView}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-r-lg transition-colors"
            title="Fit all nodes into view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Fit
          </button>

          {/* Layout Dropdown Menu */}
          {showLayoutMenu && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
              <p className="px-3 py-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Arrange Layout</p>
              <button
                onClick={() => handleLayout('horizontal')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
              >
                <span className="text-base">→</span>
                <div>
                  <p className="font-medium">Horizontal (DAG)</p>
                  <p className="text-[10px] text-gray-400">Input → Agents → Output</p>
                </div>
              </button>
              <button
                onClick={() => handleLayout('vertical')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
              >
                <span className="text-base">↓</span>
                <div>
                  <p className="font-medium">Vertical (Top-Down)</p>
                  <p className="text-[10px] text-gray-400">Flows from top to bottom</p>
                </div>
              </button>
              <button
                onClick={() => handleLayout('radial')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
              >
                <span className="text-base">◎</span>
                <div>
                  <p className="font-medium">Radial (Star)</p>
                  <p className="text-[10px] text-gray-400">Agents center, tools around</p>
                </div>
              </button>
              <button
                onClick={() => handleLayout('grid')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
              >
                <span className="text-base">⊞</span>
                <div>
                  <p className="font-medium">Grid</p>
                  <p className="text-[10px] text-gray-400">Uniform rows and columns</p>
                </div>
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => handleLayout('random')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-pink-50 hover:text-pink-700 transition-colors text-left"
              >
                <span className="text-base">🎲</span>
                <div>
                  <p className="font-medium">Shuffle (Random)</p>
                  <p className="text-[10px] text-gray-400">Scatter nodes randomly</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Graph Mode */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 px-3 py-1.5 flex items-center gap-2">
          <Network className={`w-3.5 h-3.5 ${graphMode ? 'text-purple-600' : 'text-gray-400'}`} />
          <span className="text-xs font-medium text-gray-600">Graph</span>
          <button
            onClick={() => onGraphModeChange?.(!graphMode)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${graphMode ? 'bg-purple-600' : 'bg-gray-300'}`}
            title="Toggle Graph Mode: DAG-based orchestration"
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${graphMode ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={(edge) => isValidConnectionCallback(edge as Connection)}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        snapToGrid={true}
        snapGrid={[20, 20]}
        deleteKeyCode={["Delete", "Backspace"]}
        multiSelectionKeyCode={["Meta", "Ctrl"]}
        fitView
        attributionPosition="bottom-left"
        connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          showInteractive={false}
          className="!bg-white !border !border-gray-200 !rounded-lg !shadow-md"
        />
        <MiniMap
          nodeColor={getMiniMapNodeColor}
          maskColor="rgba(0,0,0,0.08)"
          className="!bg-white !border !border-gray-200 !rounded-lg !shadow-md"
          pannable
          zoomable
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e2e8f0"
        />

        {/* Bottom-left: Quick Add Toolbar */}
        <Panel position="bottom-center">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 flex items-center gap-1">
            {quickAddItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => handleQuickAdd(item.type)}
                  className="flex flex-col items-center px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                  title={`Add ${item.label} node`}
                >
                  <Icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[9px] text-gray-500 mt-0.5">{item.label}</span>
                </button>
              );
            })}
            <div className="w-px h-8 bg-gray-200 mx-1" />
            <button
              onClick={handleDeleteSelected}
              className="flex flex-col items-center px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors group"
              title="Delete selected nodes (Del)"
            >
              <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
              <span className="text-[9px] text-gray-500 mt-0.5">Delete</span>
            </button>
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="flex flex-col items-center px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
              title="Keyboard shortcuts"
            >
              <Keyboard className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              <span className="text-[9px] text-gray-500 mt-0.5">Keys</span>
            </button>
          </div>
        </Panel>

        {/* Node count badge */}
        <Panel position="top-left">
          <div className="bg-white/90 border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm text-xs text-gray-600 flex items-center gap-3">
            <span><strong>{nodes.length}</strong> nodes</span>
            <span><strong>{edges.length}</strong> connections</span>
          </div>
        </Panel>
      </ReactFlow>

      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-72">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-800">Keyboard Shortcuts</h4>
            <button onClick={() => setShowShortcuts(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-600">Delete node</span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">Del / ⌫</kbd></div>
            <div className="flex justify-between"><span className="text-gray-600">Multi-select</span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">Ctrl/⌘ + Click</kbd></div>
            <div className="flex justify-between"><span className="text-gray-600">Pan canvas</span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">Drag background</kbd></div>
            <div className="flex justify-between"><span className="text-gray-600">Zoom in/out</span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">Scroll / Pinch</kbd></div>
            <div className="flex justify-between"><span className="text-gray-600">Fit view</span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">Controls button</kbd></div>
            <div className="flex justify-between"><span className="text-gray-600">Connect nodes</span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">Drag handle → handle</kbd></div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-1">Start building your agent</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Drag nodes from the palette on the left, or use the quick-add bar below
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
