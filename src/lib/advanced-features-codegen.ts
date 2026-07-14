/**
 * Advanced Features Code Generator — Memory Manager, Streaming Config, Community Tools
 *
 * Handles:
 * - Memory Manager (Bedrock Knowledge Base, custom memory stores)
 * - Callback Handler configuration (custom, None, PrintingCallbackHandler)
 * - Bidirectional Streaming / Voice Agent toggle
 *
 * Based on Strands Agents SDK:
 * https://strandsagents.com/docs/user-guide/concepts/agents/
 * https://strandsagents.com/docs/user-guide/concepts/streaming/
 * https://strandsagents.com/docs/user-guide/concepts/bidirectional-streaming/quickstart/
 *
 * Security:
 * - Knowledge Base IDs validated (alphanumeric + hyphens)
 * - No hardcoded credentials — env var references
 * - Memory store paths sanitized
 */

export interface AdvancedFeaturesCodeOptions {
  // Memory Manager
  memoryEnabled?: boolean;
  memoryType?: 'bedrock_kb' | 'mem0' | 'custom';
  memoryKnowledgeBaseId?: string;
  memoryRegion?: string;
  memoryCustomImport?: string;
  // Callback Handler
  callbackHandlerType?: 'none' | 'printing' | 'custom';
  callbackHandlerCustomCode?: string;
  // Bidirectional Streaming
  bidirectionalStreamingEnabled?: boolean;
  bidirectionalStreamingProvider?: 'websocket' | 'webrtc';
}

function sanitizeId(id: string): string {
  return (id || '').replace(/[^a-zA-Z0-9\-_]/g, '');
}

/**
 * Generate import statements for advanced features.
 */
export function generateAdvancedImports(data: AdvancedFeaturesCodeOptions): string[] {
  const imports: string[] = [];

  if (data.memoryEnabled) {
    if (data.memoryType === 'bedrock_kb') {
      imports.push('from strands_tools import retrieve');
    } else if (data.memoryType === 'mem0') {
      imports.push('from strands_tools import mem0_memory');
    }
  }

  if (data.callbackHandlerType === 'printing') {
    imports.push('from strands.handlers import PrintingCallbackHandler');
  }

  if (data.bidirectionalStreamingEnabled) {
    imports.push('# Bidirectional streaming requires strands[voice] extra');
    imports.push('# pip install "strands-agents[voice]"');
  }

  return imports;
}

/**
 * Generate memory configuration code (pre-agent setup).
 */
export function generateMemorySetupCode(data: AdvancedFeaturesCodeOptions): string {
  if (!data.memoryEnabled) return '';

  const lines: string[] = [];

  if (data.memoryType === 'bedrock_kb') {
    const kbId = sanitizeId(data.memoryKnowledgeBaseId || '');
    const region = sanitizeId(data.memoryRegion || 'us-east-1');

    lines.push(`# Memory — Bedrock Knowledge Base`);
    lines.push(`# Provides retrieval-augmented generation (RAG) from your knowledge base`);
    if (kbId) {
      lines.push(`os.environ.setdefault("KNOWLEDGE_BASE_ID", "${kbId}")`);
    } else {
      lines.push(`# Set KNOWLEDGE_BASE_ID env var to your Bedrock Knowledge Base ID`);
    }
    lines.push(`os.environ.setdefault("AWS_REGION", "${region}")`);
  } else if (data.memoryType === 'mem0') {
    lines.push(`# Memory — Mem0 (persistent conversational memory)`);
    lines.push(`# Requires: pip install mem0ai`);
    lines.push(`# Set MEM0_API_KEY env var for cloud mode, or runs locally`);
  } else if (data.memoryType === 'custom') {
    lines.push(`# Memory — Custom memory store`);
    if (data.memoryCustomImport) {
      lines.push(data.memoryCustomImport);
    }
  }

  return lines.join('\n');
}

/**
 * Get memory tool to add to agent's tools list.
 */
export function getMemoryToolKwarg(data: AdvancedFeaturesCodeOptions): string {
  if (!data.memoryEnabled) return '';

  if (data.memoryType === 'bedrock_kb') {
    return 'retrieve';
  } else if (data.memoryType === 'mem0') {
    return 'mem0_memory';
  }

  return '';
}

/**
 * Get callback handler kwarg for Agent constructor.
 */
export function getCallbackHandlerKwarg(data: AdvancedFeaturesCodeOptions): string {
  if (!data.callbackHandlerType || data.callbackHandlerType === 'none') {
    return 'callback_handler=None';
  }

  if (data.callbackHandlerType === 'printing') {
    return 'callback_handler=PrintingCallbackHandler()';
  }

  if (data.callbackHandlerType === 'custom' && data.callbackHandlerCustomCode) {
    return `callback_handler=${data.callbackHandlerCustomCode.trim()}`;
  }

  return 'callback_handler=None';
}

/**
 * Generate bidirectional streaming setup code.
 */
export function generateBidirectionalStreamingCode(data: AdvancedFeaturesCodeOptions): string {
  if (!data.bidirectionalStreamingEnabled) return '';

  const lines: string[] = [];
  lines.push(`# Bidirectional Streaming — Real-time Voice/Audio Agent`);
  lines.push(`# This agent supports real-time bidirectional communication`);
  lines.push(`# Requires: pip install "strands-agents[voice]"`);
  lines.push(`#`);
  lines.push(`# Usage:`);
  lines.push(`# from strands.multimodal import VoiceAgent`);
  lines.push(`# voice_agent = VoiceAgent(agent=<your_agent>)`);
  lines.push(`# voice_agent.start()  # Opens WebSocket for real-time audio`);

  return lines.join('\n');
}
