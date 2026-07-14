/**
 * Framework Hooks — Shared utilities for framework-aware components
 * 
 * These hooks provide framework-specific data to shared components
 * without those components needing to know about specific frameworks.
 */

import { useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { useFramework } from '../context/framework-context';
import type { FrameworkAdapter, FrameworkId, ValidationIssue } from './types';
import { FrameworkRegistry } from './registry';

/**
 * Get the active framework's node types for React Flow.
 * Returns a stable reference (memoized by framework ID).
 */
export function useFrameworkNodeTypes(): Record<string, React.ComponentType<any>> {
  const { framework } = useFramework();

  return useMemo(() => {
    if (!framework) return {};
    return framework.getNodeTypes();
  }, [framework]);
}

/**
 * Get default node data for a given node type from the active framework.
 * Falls back to generic defaults if framework doesn't provide specifics.
 */
export function useNodeDefaults() {
  const { framework } = useFramework();

  return useMemo(() => {
    return (type: string): Record<string, any> => {
      // Framework-specific defaults
      if (framework?.id === 'google-adk') {
        return getADKNodeDefaults(type);
      }
      // Strands defaults (existing behavior)
      return getStrandsNodeDefaults(type);
    };
  }, [framework]);
}

/**
 * Generate code using the active framework's code generator.
 */
export function useCodeGenerator() {
  const { framework } = useFramework();

  return useMemo(() => {
    return (nodes: Node[], edges: Edge[], options?: Record<string, unknown>): string => {
      if (!framework) return '# No framework selected\n';
      return framework.generateCode(nodes, edges, options);
    };
  }, [framework]);
}

/**
 * Validate flow using the active framework's validator.
 */
export function useFlowValidator() {
  const { framework } = useFramework();

  return useMemo(() => {
    return (nodes: Node[], edges: Edge[]): ValidationIssue[] => {
      if (!framework) return [];
      return framework.validateFlow(nodes, edges);
    };
  }, [framework]);
}

/**
 * Get edge label from the active framework.
 */
export function useEdgeLabeler() {
  const { framework } = useFramework();

  return useMemo(() => {
    return (sourceNode: Node, targetNode: Node, sourceHandle?: string | null): string => {
      if (!framework) return '';
      return framework.getEdgeLabel(sourceNode, targetNode, sourceHandle);
    };
  }, [framework]);
}

/**
 * Get minimap node color based on the active framework's node types.
 */
export function useMiniMapColors() {
  const { framework } = useFramework();

  return useMemo(() => {
    return (node: Node): string => {
      if (framework?.id === 'google-adk') {
        return getADKMiniMapColor(node);
      }
      return getStrandsMiniMapColor(node);
    };
  }, [framework]);
}

// ─── Strands Defaults ──────────────────────────────────────────

function getStrandsNodeDefaults(type: string): Record<string, any> {
  const defaults: Record<string, any> = {
    agent: {
      label: 'Agent',
      modelProvider: 'AWS Bedrock',
      modelId: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
      modelName: 'Claude 3.7 Sonnet',
      systemPrompt: 'You are a helpful AI assistant.',
      temperature: 0.7,
      maxTokens: 4000,
    },
    'orchestrator-agent': {
      label: 'Orchestrator',
      modelProvider: 'AWS Bedrock',
      modelId: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
      modelName: 'Claude 3.7 Sonnet',
      systemPrompt: 'You orchestrate multiple agents to solve complex tasks.',
      temperature: 0.7,
      maxTokens: 4000,
    },
    swarm: { label: 'Swarm', maxHandoffs: 20, maxIterations: 20, executionTimeout: 900, nodeTimeout: 300 },
    'a2a-agent': { label: 'A2A Agent', endpoint: '', timeout: 300 },
    workflow: { label: 'Workflow', workflowId: 'my_workflow', tasks: [] },
    'function-node': { label: 'Function', functionCode: 'def process(data: str) -> str:\n    """Process input data."""\n    return f"Processed: {data}"', description: 'Custom processing logic' },
    'condition-node': { label: 'Condition', conditionType: 'output_contains', conditionValue: '', customCode: '' },
    tool: { label: 'Tool', toolType: 'built-in', toolName: 'calculator' },
    'mcp-tool': { label: 'MCP Server', serverName: 'mcp_server', transportType: 'stdio', command: 'uvx', args: ['server-name@latest'], argsText: 'server-name@latest', url: 'http://localhost:8000/mcp', timeout: 30, description: 'MCP server for external tools', env: {}, envText: '' },
    input: { label: 'User Input' },
    output: { label: 'Output' },
    'custom-tool': { label: 'Custom Tool', pythonCode: '@tool\ndef my_tool(param: str) -> dict:\n    """Tool description."""\n    return {"status": "success"}' },
  };
  return defaults[type] || { label: `${type} node` };
}

function getStrandsMiniMapColor(node: Node): string {
  switch (node.type) {
    case 'agent': return '#3b82f6';
    case 'orchestrator-agent': return '#8b5cf6';
    case 'swarm': return '#10b981';
    case 'a2a-agent': return '#0ea5e9';
    case 'workflow': return '#f59e0b';
    case 'tool': return '#6b7280';
    case 'mcp-tool': return '#6366f1';
    case 'input': return '#22c55e';
    case 'output': return '#ef4444';
    case 'custom-tool': return '#ec4899';
    case 'graph-builder': return '#7c3aed';
    case 'function-node': return '#14b8a6';
    case 'condition-node': return '#eab308';
    default: return '#9ca3af';
  }
}

// ─── Google ADK Defaults ───────────────────────────────────────

function getADKNodeDefaults(type: string): Record<string, any> {
  const defaults: Record<string, any> = {
    'adk-llm-agent': {
      label: 'LLM Agent',
      name: '',
      model: 'gemini-2.0-flash',
      modelProvider: 'gemini',
      instruction: 'You are a helpful assistant.',
      description: '',
      outputKey: '',
      beforeModelCallback: false,
      afterModelCallback: false,
      beforeToolCallback: false,
      afterToolCallback: false,
    },
    'adk-sequential': {
      label: 'Sequential Agent',
      name: '',
      description: 'Runs sub-agents one after another.',
    },
    'adk-parallel': {
      label: 'Parallel Agent',
      name: '',
      description: 'Runs sub-agents concurrently.',
    },
    'adk-loop': {
      label: 'Loop Agent',
      name: '',
      description: 'Loops sub-agents until escalation.',
      maxIterations: 10,
    },
    'adk-function-tool': {
      label: 'Function Tool',
      functionName: 'my_tool',
      description: 'A custom tool function.',
      code: '    return {"status": "success", "result": query}',
    },
    'adk-mcp-tool': {
      label: 'MCP Toolset',
      serverName: 'my_mcp_server',
      transport: 'stdio',
      command: 'npx',
      url: '',
    },
    'adk-builtin-tool': {
      label: 'Google Search',
      toolType: 'google_search',
    },
    'adk-a2a-tool': {
      label: 'A2A Agent',
      agentUrl: '',
      name: 'remote_agent',
      description: 'Remote agent via A2A protocol',
    },
    'adk-custom-agent': {
      label: 'Custom Agent',
      name: '',
      description: 'Custom BaseAgent implementation',
      className: 'MyCustomAgent',
      code: '    async def _run_async_impl(self, ctx):\n        # Custom orchestration logic\n        pass',
    },
    'adk-input': { label: 'Input' },
    'adk-output': { label: 'Output' },
  };
  return defaults[type] || { label: `${type} node` };
}

function getADKMiniMapColor(node: Node): string {
  switch (node.type) {
    case 'adk-llm-agent': return '#3b82f6';
    case 'adk-sequential': return '#8b5cf6';
    case 'adk-parallel': return '#f97316';
    case 'adk-loop': return '#14b8a6';
    case 'adk-custom-agent': return '#64748b';
    case 'adk-function-tool': return '#22c55e';
    case 'adk-mcp-tool': return '#06b6d4';
    case 'adk-builtin-tool': return '#eab308';
    case 'adk-a2a-tool': return '#ec4899';
    case 'adk-input': return '#22c55e';
    case 'adk-output': return '#ef4444';
    default: return '#9ca3af';
  }
}
