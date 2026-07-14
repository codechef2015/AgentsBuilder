/**
 * Google ADK — Framework Adapter
 * 
 * Implements the FrameworkAdapter interface for Google Agent Development Kit.
 * Covers LlmAgent, SequentialAgent, ParallelAgent, LoopAgent, FunctionTool, MCPToolset.
 */

import type { Node, Edge } from '@xyflow/react';
import type { FrameworkAdapter, NodePaletteCategory, ValidationIssue, DeployTarget, ModelProvider, Template } from '../types';

// ADK Node components (will be created next)
import { ADKLlmAgentNode } from './nodes/llm-agent-node';
import { ADKSequentialAgentNode } from './nodes/sequential-agent-node';
import { ADKParallelAgentNode } from './nodes/parallel-agent-node';
import { ADKLoopAgentNode } from './nodes/loop-agent-node';
import { ADKCustomAgentNode } from './nodes/custom-agent-node';
import { ADKFunctionToolNode } from './nodes/function-tool-node';
import { ADKMCPToolNode } from './nodes/mcp-tool-node';
import { ADKBuiltinToolNode } from './nodes/builtin-tool-node';
import { ADKA2AToolNode } from './nodes/a2a-tool-node';
import { ADKInputNode } from './nodes/input-node';
import { ADKOutputNode } from './nodes/output-node';

// ADK Code generation
import { generateADKCode } from './code-generator';

export const GoogleADKAdapter: FrameworkAdapter = {
  id: 'google-adk',
  name: 'Google ADK',
  description: 'Build agents with Google\'s Agent Development Kit. LlmAgent, workflow agents (Sequential, Parallel, Loop), Gemini-first.',
  version: '1.36.1',
  docUrl: 'https://google.github.io/adk-docs/',
  features: ['Python', 'GCP', 'Gemini', 'Vertex AI', 'MCP', 'A2A', 'Callbacks'],

  getNodeTypes() {
    return {
      'adk-llm-agent': ADKLlmAgentNode,
      'adk-sequential': ADKSequentialAgentNode,
      'adk-parallel': ADKParallelAgentNode,
      'adk-loop': ADKLoopAgentNode,
      'adk-custom-agent': ADKCustomAgentNode,
      'adk-function-tool': ADKFunctionToolNode,
      'adk-mcp-tool': ADKMCPToolNode,
      'adk-builtin-tool': ADKBuiltinToolNode,
      'adk-a2a-tool': ADKA2AToolNode,
      'adk-input': ADKInputNode,
      'adk-output': ADKOutputNode,
    };
  },

  getNodePaletteCategories(): NodePaletteCategory[] {
    return [
      {
        id: 'io',
        label: 'IO',
        nodes: [
          { type: 'adk-input', label: 'Input', description: 'User message / session input', color: 'green' },
          { type: 'adk-output', label: 'Output', description: 'Agent response', color: 'red' },
        ],
      },
      {
        id: 'agents',
        label: 'Agents',
        nodes: [
          { type: 'adk-llm-agent', label: 'LLM Agent', description: 'Reasoning agent with model + tools', color: 'blue', docUrl: 'https://google.github.io/adk-docs/agents/llm-agents/' },
          { type: 'adk-sequential', label: 'Sequential Agent', description: 'Runs sub-agents in order', color: 'purple', docUrl: 'https://google.github.io/adk-docs/agents/workflow-agents/sequential-agent/' },
          { type: 'adk-parallel', label: 'Parallel Agent', description: 'Runs sub-agents concurrently', color: 'orange', docUrl: 'https://google.github.io/adk-docs/agents/workflow-agents/parallel-agent/' },
          { type: 'adk-loop', label: 'Loop Agent', description: 'Repeats sub-agents until condition', color: 'teal', docUrl: 'https://google.github.io/adk-docs/agents/workflow-agents/loop-agent/' },
          { type: 'adk-custom-agent', label: 'Custom Agent', description: 'User-defined BaseAgent', color: 'slate', docUrl: 'https://google.github.io/adk-docs/agents/custom-agents/' },
        ],
      },
      {
        id: 'tools',
        label: 'Tools',
        nodes: [
          { type: 'adk-function-tool', label: 'Function Tool', description: 'Python function as tool', color: 'green', docUrl: 'https://google.github.io/adk-docs/tools/' },
          { type: 'adk-mcp-tool', label: 'MCP Toolset', description: 'MCP server integration', color: 'cyan', docUrl: 'https://google.github.io/adk-docs/tools-custom/mcp-tools/' },
          { type: 'adk-builtin-tool', label: 'Built-in Tool', description: 'google_search, code_execution', color: 'yellow', docUrl: 'https://google.github.io/adk-docs/tools/' },
          { type: 'adk-a2a-tool', label: 'A2A Agent', description: 'Remote Agent-to-Agent protocol', color: 'pink', docUrl: 'https://google.github.io/adk-docs/a2a/' },
        ],
      },
    ];
  },

  getDefaultNodes(): Node[] {
    return [];
  },

  generateCode(nodes: Node[], edges: Edge[], _options?: Record<string, unknown>): string {
    return generateADKCode(nodes, edges);
  },

  validateFlow(nodes: Node[], edges: Edge[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Must have at least one LLM agent
    const hasAgent = nodes.some(n => n.type === 'adk-llm-agent');
    if (!hasAgent && nodes.length > 0) {
      issues.push({ type: 'warning', message: 'Flow has no LLM Agent node. At least one agent is needed.' });
    }

    // Sequential/Parallel/Loop agents need sub-agents connected
    const workflowAgents = nodes.filter(n =>
      n.type === 'adk-sequential' || n.type === 'adk-parallel' || n.type === 'adk-loop'
    );
    for (const wa of workflowAgents) {
      const hasSubAgents = edges.some(e => e.target === wa.id);
      if (!hasSubAgents) {
        issues.push({
          nodeId: wa.id,
          type: 'error',
          message: `${wa.data?.label || 'Workflow agent'} has no sub-agents connected.`,
        });
      }
    }

    // LLM agents should have a name
    const llmAgents = nodes.filter(n => n.type === 'adk-llm-agent');
    for (const agent of llmAgents) {
      if (!agent.data?.name) {
        issues.push({
          nodeId: agent.id,
          type: 'error',
          message: 'LLM Agent requires a name.',
          field: 'name',
        });
      }
    }

    return issues;
  },

  validateConnection(
    sourceNode: Node,
    targetNode: Node,
    _sourceHandle?: string | null,
    _targetHandle?: string | null
  ): boolean {
    // Tools can only connect to agents
    const toolTypes = ['adk-function-tool', 'adk-mcp-tool', 'adk-builtin-tool'];
    const agentTypes = ['adk-llm-agent', 'adk-sequential', 'adk-parallel', 'adk-loop'];

    if (toolTypes.includes(sourceNode.type || '')) {
      return agentTypes.includes(targetNode.type || '');
    }

    // Agents can connect to workflow agents (as sub-agents)
    if (agentTypes.includes(sourceNode.type || '') && agentTypes.includes(targetNode.type || '')) {
      return true;
    }

    // Input → Agent
    if (sourceNode.type === 'adk-input') {
      return agentTypes.includes(targetNode.type || '');
    }

    // Agent → Output
    if (targetNode.type === 'adk-output') {
      return agentTypes.includes(sourceNode.type || '');
    }

    return true;
  },

  getPropertyPanelConfig(_node: Node) {
    // Will be implemented with ADK-specific config panels
    return null;
  },

  getDeployTargets(): DeployTarget[] {
    return [
      { id: 'vertex-ai', name: 'Vertex AI Agent Engine', description: 'Managed agent on Google Cloud', icon: '☁️', available: true },
      { id: 'cloud-run', name: 'Cloud Run', description: 'Serverless container', icon: '🐳', available: true },
    ];
  },

  getDeployPanel() {
    // Placeholder — will be implemented in Phase 3
    return () => null;
  },

  getModelProviders(): ModelProvider[] {
    return [
      {
        id: 'gemini',
        name: 'Google Gemini',
        description: 'Default model for ADK agents',
        models: [
          { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast, versatile' },
          { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable' },
          { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Latest fast model' },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Previous generation' },
        ],
        configFields: [
          { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'GOOGLE_API_KEY env var', helpText: 'Set GOOGLE_API_KEY environment variable' },
        ],
      },
      {
        id: 'vertex-ai',
        name: 'Vertex AI',
        description: 'Google Cloud Vertex AI endpoint',
        models: [
          { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
          { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        ],
        configFields: [
          { key: 'project', label: 'GCP Project', type: 'text', required: true, placeholder: 'my-gcp-project' },
          { key: 'location', label: 'Region', type: 'text', default: 'us-central1' },
        ],
      },
      {
        id: 'litellm',
        name: 'LiteLLM',
        description: 'Use any LiteLLM-supported model',
        models: [
          { id: 'gpt-4o', name: 'GPT-4o (via LiteLLM)' },
          { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (via LiteLLM)' },
        ],
        configFields: [
          { key: 'model', label: 'Model ID', type: 'text', required: true, placeholder: 'openai/gpt-4o' },
          { key: 'api_base', label: 'API Base URL', type: 'text', placeholder: 'https://...' },
        ],
      },
      {
        id: 'ollama',
        name: 'Ollama',
        description: 'Local models via Ollama',
        models: [
          { id: 'llama3.1', name: 'Llama 3.1' },
          { id: 'mistral', name: 'Mistral' },
          { id: 'qwen2.5', name: 'Qwen 2.5' },
        ],
        configFields: [
          { key: 'model', label: 'Model Name', type: 'text', required: true, placeholder: 'llama3.1' },
          { key: 'host', label: 'Ollama Host', type: 'text', default: 'http://localhost:11434' },
        ],
      },
    ];
  },

  getTemplates(): Template[] {
    return [];
  },

  getEdgeLabel(sourceNode: Node, _targetNode: Node, _sourceHandle?: string | null): string {
    const toolTypes = ['adk-function-tool', 'adk-mcp-tool', 'adk-builtin-tool'];
    if (toolTypes.includes(sourceNode.type || '')) return 'tool';
    if (sourceNode.type === 'adk-llm-agent') return 'sub-agent';
    return '';
  },
};
