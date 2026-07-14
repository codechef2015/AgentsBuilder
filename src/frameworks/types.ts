/**
 * Framework Adapter Interface
 * 
 * Defines the contract that each framework (Strands, Google ADK) must implement
 * to integrate with the shared visual editor.
 */

import type { Node, Edge } from '@xyflow/react';

// Framework identifiers
export type FrameworkId = 'strands' | 'google-adk';

// Validation issue from flow validator
export interface ValidationIssue {
  nodeId?: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}

// Model provider definition
export interface ModelProvider {
  id: string;
  name: string;
  description: string;
  models: ModelOption[];
  configFields: ConfigField[];
}

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'password' | 'textarea';
  required?: boolean;
  default?: string | number | boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helpText?: string;
}

// Template definition
export interface Template {
  id: string;
  name: string;
  description: string;
  framework: FrameworkId;
  pattern: string;
  nodes: Node[];
  edges: Edge[];
  tags?: string[];
  source?: string;
}

// Property panel props passed to framework-specific config
export interface PropertyPanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, data: Record<string, unknown>) => void;
  nodes: Node[];
  edges: Edge[];
}

// Deploy target definition
export interface DeployTarget {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

// Node palette category
export interface NodePaletteCategory {
  id: string;
  label: string;
  nodes: PaletteNode[];
}

export interface PaletteNode {
  type: string;
  label: string;
  description: string;
  icon?: string;
  color?: string;
  docUrl?: string;
}

/**
 * FrameworkAdapter — the contract each framework must implement.
 * 
 * This interface ensures both Strands and Google ADK provide the same
 * capabilities to the shared visual editor shell.
 */
export interface FrameworkAdapter {
  // Identity
  id: FrameworkId;
  name: string;
  description: string;
  version: string;
  docUrl: string;
  features: string[];

  // Node system
  getNodeTypes(): Record<string, React.ComponentType<any>>;
  getNodePaletteCategories(): NodePaletteCategory[];
  getDefaultNodes(): Node[];

  // Code generation
  generateCode(nodes: Node[], edges: Edge[], options?: Record<string, unknown>): string;

  // Validation
  validateFlow(nodes: Node[], edges: Edge[]): ValidationIssue[];
  validateConnection(
    sourceNode: Node,
    targetNode: Node,
    sourceHandle?: string | null,
    targetHandle?: string | null
  ): boolean;

  // Configuration
  getPropertyPanelConfig(node: Node): {
    component: React.ComponentType<PropertyPanelProps>;
    label: string;
  } | null;

  // Deployment
  getDeployTargets(): DeployTarget[];
  getDeployPanel(): React.ComponentType<any>;

  // Model providers
  getModelProviders(): ModelProvider[];

  // Templates
  getTemplates(): Template[];

  // Edge labels
  getEdgeLabel(sourceNode: Node, targetNode: Node, sourceHandle?: string | null): string;
}
