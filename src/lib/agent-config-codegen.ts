/**
 * Agent Config Code Generator — Generates Python code for agent-level configuration
 * 
 * Handles:
 * - Retry Strategy (ModelRetryStrategy)
 * - Conversation Manager (SlidingWindowConversationManager, SummarizingConversationManager)
 * - Session Manager (FileSessionManager, S3SessionManager)
 * - Invocation Limits (turns, total_tokens)
 * - Structured Output (Pydantic models)
 */

interface AgentConfigCodeOptions {
  // Retry
  retryEnabled?: boolean;
  retryMaxAttempts?: number;
  retryInitialDelay?: number;
  retryMaxDelay?: number;
  // Conversation Manager
  conversationManager?: string;
  conversationWindowSize?: number;
  conversationSummaryTokens?: number;
  conversationPreserveRecent?: number;
  // Session Manager
  sessionManager?: string;
  sessionDirectory?: string;
  sessionS3Bucket?: string;
  sessionS3Prefix?: string;
  // Invocation Limits
  maxTurns?: number;
  totalTokenBudget?: number;
  // Structured Output
  structuredOutputEnabled?: boolean;
  structuredOutputSchema?: string;
}

/**
 * Generate import statements needed for agent configuration
 */
export function generateAgentConfigImports(data: AgentConfigCodeOptions): string[] {
  const imports: string[] = [];

  // Retry strategy
  if (data.retryEnabled !== false && (data.retryMaxAttempts || data.retryInitialDelay || data.retryMaxDelay)) {
    imports.push('from strands import ModelRetryStrategy');
  }

  // Conversation Manager
  if (data.conversationManager === 'sliding_window') {
    imports.push('from strands.agent.conversation_manager import SlidingWindowConversationManager');
  } else if (data.conversationManager === 'summarizing') {
    imports.push('from strands.agent.conversation_manager import SummarizingConversationManager');
  } else if (data.conversationManager === 'null') {
    imports.push('from strands.agent.conversation_manager import NullConversationManager');
  }

  // Session Manager
  if (data.sessionManager === 'file') {
    imports.push('from strands.session import FileSessionManager');
  } else if (data.sessionManager === 's3') {
    imports.push('from strands.session import S3SessionManager');
  }

  // Structured Output
  if (data.structuredOutputEnabled && data.structuredOutputSchema) {
    imports.push('from pydantic import BaseModel');
  }

  return imports;
}

/**
 * Generate Python code for agent constructor kwargs (retry_strategy, conversation_manager, etc.)
 * Returns array of "key=value" strings to be inserted into Agent() constructor
 */
export function generateAgentConfigKwargs(data: AgentConfigCodeOptions): string[] {
  const kwargs: string[] = [];

  // Retry Strategy
  if (data.retryEnabled === false) {
    kwargs.push('retry_strategy=ModelRetryStrategy(max_attempts=1)');
  } else if (data.retryMaxAttempts || data.retryInitialDelay || data.retryMaxDelay) {
    const retryParams: string[] = [];
    if (data.retryMaxAttempts && data.retryMaxAttempts !== 6) {
      retryParams.push(`max_attempts=${data.retryMaxAttempts}`);
    }
    if (data.retryInitialDelay && data.retryInitialDelay !== 4) {
      retryParams.push(`initial_delay=${data.retryInitialDelay}`);
    }
    if (data.retryMaxDelay && data.retryMaxDelay !== 128) {
      retryParams.push(`max_delay=${data.retryMaxDelay}`);
    }
    if (retryParams.length > 0) {
      kwargs.push(`retry_strategy=ModelRetryStrategy(${retryParams.join(', ')})`);
    }
  }

  // Conversation Manager
  if (data.conversationManager === 'sliding_window') {
    const windowSize = data.conversationWindowSize || 20;
    kwargs.push(`conversation_manager=SlidingWindowConversationManager(window_size=${windowSize})`);
  } else if (data.conversationManager === 'summarizing') {
    const params: string[] = [];
    if (data.conversationSummaryTokens && data.conversationSummaryTokens !== 2000) {
      params.push(`max_summary_tokens=${data.conversationSummaryTokens}`);
    }
    if (data.conversationPreserveRecent && data.conversationPreserveRecent !== 4) {
      params.push(`preserve_recent_messages=${data.conversationPreserveRecent}`);
    }
    kwargs.push(`conversation_manager=SummarizingConversationManager(${params.join(', ')})`);
  } else if (data.conversationManager === 'null') {
    kwargs.push('conversation_manager=NullConversationManager()');
  }

  // Session Manager
  if (data.sessionManager === 'file') {
    const dir = data.sessionDirectory || './sessions';
    kwargs.push(`session_manager=FileSessionManager(directory="${dir}")`);
  } else if (data.sessionManager === 's3') {
    const params: string[] = [];
    if (data.sessionS3Bucket) {
      params.push(`bucket="${data.sessionS3Bucket}"`);
    }
    if (data.sessionS3Prefix) {
      params.push(`prefix="${data.sessionS3Prefix}"`);
    }
    kwargs.push(`session_manager=S3SessionManager(${params.join(', ')})`);
  }

  return kwargs;
}

/**
 * Generate the invocation limits dict for agent.__call__() 
 * Returns the limits= kwarg string, or empty string if no limits set
 */
export function generateInvocationLimits(data: AgentConfigCodeOptions): string {
  const limits: string[] = [];

  if (data.maxTurns) {
    limits.push(`"turns": ${data.maxTurns}`);
  }
  if (data.totalTokenBudget) {
    limits.push(`"total_tokens": ${data.totalTokenBudget}`);
  }

  if (limits.length === 0) return '';
  return `limits={${limits.join(', ')}}`;
}

/**
 * Generate the structured output Pydantic class definition
 * Returns the class code to be placed before agent instantiation
 */
export function generateStructuredOutputCode(data: AgentConfigCodeOptions): string {
  if (!data.structuredOutputEnabled || !data.structuredOutputSchema) {
    return '';
  }

  // The user provides the full class definition — just return it
  return data.structuredOutputSchema.trim();
}

/**
 * Get the output_model kwarg for Agent() if structured output is enabled
 */
export function getStructuredOutputKwarg(data: AgentConfigCodeOptions): string | null {
  if (!data.structuredOutputEnabled || !data.structuredOutputSchema) {
    return null;
  }

  // Extract class name from the schema (first line: "class ClassName(BaseModel):")
  const match = data.structuredOutputSchema.match(/class\s+(\w+)\s*\(/);
  if (match) {
    return `output_model=${match[1]}`;
  }
  return null;
}
