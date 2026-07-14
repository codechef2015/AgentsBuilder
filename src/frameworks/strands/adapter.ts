/**
 * Strands Agents SDK — Framework Adapter
 * 
 * Wraps all existing Strands-specific code into the FrameworkAdapter interface.
 * This is a bridge adapter — it delegates to existing components without moving them yet.
 * Phase 2 will fully relocate files into this folder.
 */

import type { Node, Edge } from '@xyflow/react';
import type { FrameworkAdapter, NodePaletteCategory, ValidationIssue, DeployTarget, ModelProvider, Template } from '../types';

// Re-export existing components (these will be moved in Phase 2)
import { AgentNode } from '../../components/nodes/agent-node';
import { OrchestratorAgentNode } from '../../components/nodes/orchestrator-agent-node';
import { SwarmNode } from '../../components/nodes/swarm-node';
import { ToolNode } from '../../components/nodes/tool-node';
import { InputNode } from '../../components/nodes/input-node';
import { OutputNode } from '../../components/nodes/output-node';
import { CustomToolNode } from '../../components/nodes/custom-tool-node';
import { MCPToolNode } from '../../components/nodes/mcp-tool-node';
import { GraphBuilderNode } from '../../components/nodes/graph-builder-node';
import { A2AAgentNode } from '../../components/nodes/a2a-agent-node';
import { WorkflowNode } from '../../components/nodes/workflow-node';
import { FunctionNode } from '../../components/nodes/function-node';
import { ConditionNode } from '../../components/nodes/condition-node';

// Code generation
import { generateStrandsAgentCode } from '../../lib/code-generator';

// Validation
import { validateFlow } from '../../lib/flow-validator';

// Deploy
import { DeployPanel } from '../../components/deploy-panel';

export const StrandsAdapter: FrameworkAdapter = {
  id: 'strands',
  name: 'Strands Agents',
  description: 'Build agents with the Strands SDK. Multi-agent orchestration with Graph, Swarm, A2A patterns. Deploy to AWS.',
  version: '1.47.0',
  docUrl: 'https://strandsagents.com/',
  features: ['Python', 'AWS', '15+ Models', 'Graph', 'Swarm', 'A2A', 'MCP'],

  getNodeTypes() {
    return {
      agent: AgentNode,
      'orchestrator-agent': OrchestratorAgentNode,
      swarm: SwarmNode,
      tool: ToolNode,
      input: InputNode,
      output: OutputNode,
      'custom-tool': CustomToolNode,
      'mcp-tool': MCPToolNode,
      'graph-builder': GraphBuilderNode,
      'a2a-agent': A2AAgentNode,
      workflow: WorkflowNode,
      'function-node': FunctionNode,
      'condition-node': ConditionNode,
    };
  },

  getNodePaletteCategories(): NodePaletteCategory[] {
    return [
      {
        id: 'io',
        label: 'IO',
        nodes: [
          { type: 'input', label: 'Input', description: 'User input prompt', color: 'green' },
          { type: 'output', label: 'Output', description: 'Agent response', color: 'red' },
        ],
      },
      {
        id: 'core',
        label: 'Core',
        nodes: [
          { type: 'agent', label: 'Agent', description: 'Strands Agent with LLM', color: 'blue' },
        ],
      },
      {
        id: 'tools',
        label: 'Tools',
        nodes: [
          { type: 'tool', label: 'Built-in Tool', description: 'Pre-built tools', color: 'gray' },
          { type: 'mcp-tool', label: 'MCP Server', description: 'MCP protocol server', color: 'indigo' },
          { type: 'custom-tool', label: 'Custom Tool', description: '@tool function', color: 'pink' },
        ],
      },
      {
        id: 'multi-agent',
        label: 'Multi-Agent',
        nodes: [
          { type: 'orchestrator-agent', label: 'Orchestrator', description: 'Agents-as-Tools', color: 'purple' },
          { type: 'swarm', label: 'Swarm', description: 'Autonomous handoff', color: 'emerald' },
          { type: 'a2a-agent', label: 'A2A Agent', description: 'Remote agent protocol', color: 'sky' },
          { type: 'workflow', label: 'Workflow', description: 'DAG pipeline', color: 'amber' },
          { type: 'function-node', label: 'Function Node', description: 'Pure Python (no LLM)', color: 'teal' },
          { type: 'condition-node', label: 'Condition', description: 'If/else branching', color: 'yellow' },
        ],
      },
    ];
  },

  getDefaultNodes(): Node[] {
    return [];
  },

  generateCode(nodes: Node[], edges: Edge[], options?: Record<string, unknown>): string {
    const graphMode = options?.graphMode as boolean ?? false;
    const result = generateStrandsAgentCode(nodes, edges, graphMode);
    // Combine imports + code into a single string
    return result.imports.join('\n') + '\n\n' + result.code;
  },

  validateFlow(nodes: Node[], edges: Edge[]): ValidationIssue[] {
    const strandsIssues = validateFlow(nodes, edges);
    // Map Strands format (severity/title/description) to framework format (type/message)
    return strandsIssues.map(issue => ({
      nodeId: issue.nodeId,
      type: issue.severity as 'error' | 'warning' | 'info',
      message: issue.title + (issue.description ? ': ' + issue.description : ''),
      field: undefined,
    }));
  },

  validateConnection(
    sourceNode: Node,
    targetNode: Node,
    sourceHandle?: string | null,
    _targetHandle?: string | null
  ): boolean {
    // Delegate to existing connection validator logic
    // For now, allow all connections (existing validator runs separately)
    void sourceNode;
    void targetNode;
    void sourceHandle;
    return true;
  },

  getPropertyPanelConfig(_node: Node) {
    // The existing property panel handles this internally
    // Will be refactored in Phase 2 to return framework-specific config components
    return null;
  },

  getDeployTargets(): DeployTarget[] {
    return [
      { id: 'agentcore', name: 'AWS Bedrock AgentCore', description: 'Managed agent runtime', icon: '☁️', available: true },
      { id: 'lambda', name: 'AWS Lambda', description: 'Serverless function', icon: 'λ', available: true },
      { id: 'ecs-fargate', name: 'ECS Fargate', description: 'Container-based', icon: '🐳', available: true },
    ];
  },

  getDeployPanel() {
    return DeployPanel;
  },

  getModelProviders(): ModelProvider[] {
    // Simplified list — full providers loaded from existing model-providers.ts
    return [
      { id: 'bedrock', name: 'AWS Bedrock', description: 'Amazon Bedrock models', models: [], configFields: [] },
      { id: 'openai', name: 'OpenAI', description: 'GPT models', models: [], configFields: [] },
      { id: 'anthropic', name: 'Anthropic', description: 'Claude models', models: [], configFields: [] },
      { id: 'gemini', name: 'Google Gemini', description: 'Gemini models', models: [], configFields: [] },
      { id: 'ollama', name: 'Ollama', description: 'Local models', models: [], configFields: [] },
    ];
  },

  getTemplates(): Template[] {
    // Templates loaded from DB via API — return empty here
    return [];
  },

  getEdgeLabel(sourceNode: Node, _targetNode: Node, sourceHandle?: string | null): string {
    if (sourceHandle === 'true') return '✓ true';
    if (sourceHandle === 'false') return '✗ false';
    if (sourceNode.type === 'tool' || sourceNode.type === 'custom-tool' || sourceNode.type === 'mcp-tool') return 'tool';
    return '';
  },
};
