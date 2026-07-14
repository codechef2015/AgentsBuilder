import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { Bot, X, Shield, Zap, Brain, Activity, AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AgentNodeData {
  label?: string;
  modelProvider?: string;
  modelId?: string;
  modelName?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
  apiKey?: string;
  baseUrl?: string;
  thinkingEnabled?: boolean;
  thinkingBudgetTokens?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  bedrockGuardrailEnabled?: boolean;
  agentControlEnabled?: boolean;
  customGuardrailHookEnabled?: boolean;
  otelEnabled?: boolean;
  memoryEnabled?: boolean;
  memoryType?: string;
  goalLoopEnabled?: boolean;
  humanInLoopEnabled?: boolean;
  maxTurns?: number;
  totalTokenBudget?: number;
  retryEnabled?: boolean;
  conversationManager?: string;
  sessionManager?: string;
  agentSopEnabled?: boolean;
  // Validation
  _validationStatus?: 'error' | 'warning' | 'info';
  _validationMessages?: string[];
}

/** Compute validation messages for hover tooltip */
function getValidationMessages(data: AgentNodeData): string[] {
  const msgs: string[] = [];
  if (!data.systemPrompt || (data.systemPrompt || '').trim().length < 10) {
    msgs.push('⚠️ Add a meaningful system prompt (role + constraints)');
  }
  if (!data.modelProvider && !data.modelId) {
    msgs.push('❌ No model configured');
  }
  if (!(data.bedrockGuardrailEnabled || data.agentControlEnabled || data.customGuardrailHookEnabled)) {
    msgs.push('ℹ️ No guardrails — consider enabling for production');
  }
  if (!data.maxTurns && !data.totalTokenBudget) {
    msgs.push('ℹ️ No invocation limits set — risk of runaway loops');
  }
  if ((data.temperature || 0.7) > 0.9) {
    msgs.push('ℹ️ High temperature — outputs will be very random');
  }
  return msgs;
}

export function AgentNode({ data, selected, id }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const nodeData = data as AgentNodeData || {};
  const {
    label = 'Agent',
    modelProvider = 'AWS Bedrock',
    modelName = 'Claude 3.7 Sonnet',
    temperature = 0.7,
    maxTokens = 4000,
    streaming = false,
    systemPrompt = '',
    bedrockGuardrailEnabled = false,
    agentControlEnabled = false,
    customGuardrailHookEnabled = false,
    otelEnabled = false,
    memoryEnabled = false,
    memoryType = '',
    thinkingEnabled = false,
    goalLoopEnabled = false,
    humanInLoopEnabled = false,
    maxTurns,
    totalTokenBudget,
    retryEnabled,
    conversationManager,
    sessionManager,
    agentSopEnabled = false,
    _validationStatus,
  } = nodeData;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const promptPreview = systemPrompt
    ? systemPrompt.slice(0, 50) + (systemPrompt.length > 50 ? '…' : '')
    : '';

  const hasGuardrails = bedrockGuardrailEnabled || agentControlEnabled || customGuardrailHookEnabled;
  const validationMessages = getValidationMessages(nodeData);
  const hasIssues = validationMessages.length > 0;

  // Count active features for the info line
  const activeFeatures: string[] = [];
  if (maxTurns) activeFeatures.push(`${maxTurns} turns`);
  if (totalTokenBudget) activeFeatures.push(`${(totalTokenBudget / 1000).toFixed(0)}K tok`);
  if (retryEnabled !== false) activeFeatures.push('retry');
  if (conversationManager && conversationManager !== 'default') activeFeatures.push(conversationManager.replace('_', ' '));
  if (sessionManager && sessionManager !== 'none') activeFeatures.push(`session:${sessionManager}`);

  const validationBorderClass = _validationStatus === 'error'
    ? 'border-red-400 ring-2 ring-red-100'
    : _validationStatus === 'warning'
    ? 'border-amber-400 ring-1 ring-amber-100'
    : '';

  return (
    <div className={`
      bg-white rounded-xl border-2 shadow-sm min-w-[240px] max-w-[280px] transition-all duration-150 relative
      ${selected ? 'border-blue-500 shadow-xl ring-2 ring-blue-200' : validationBorderClass || 'border-gray-200 hover:border-blue-300 hover:shadow-md'}
    `}>
      {/* Validation Indicator — Hoverable with tooltip */}
      {hasIssues && !selected && (
        <div className="absolute -top-2.5 -right-2.5 z-10 group">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md cursor-help ${
            _validationStatus === 'error' ? 'bg-red-500' :
            _validationStatus === 'warning' ? 'bg-amber-500' : 'bg-blue-400'
          }`}>
            {_validationStatus === 'error' ? <AlertCircle className="w-3 h-3 text-white" /> :
             _validationStatus === 'warning' ? <AlertTriangle className="w-3 h-3 text-white" /> :
             <Info className="w-3 h-3 text-white" />}
          </div>
          {/* Hover tooltip with validation details */}
          <div className="absolute top-full right-0 mt-1 w-56 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none">
            <p className="font-semibold mb-1.5 text-gray-200">Issues:</p>
            {validationMessages.map((msg, i) => (
              <p key={i} className="leading-relaxed mb-0.5">{msg}</p>
            ))}
            <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </div>
      )}

      {/* Node Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-blue-100 rounded-t-[10px] flex items-center">
        <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center mr-2">
          <Bot className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <span className="text-sm font-semibold text-gray-800 truncate flex-1">{label}</span>
        {selected && (
          <button
            onClick={handleDelete}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Delete node"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Node Body */}
      <div className="px-3 py-2">
        {/* Model info row */}
        <div className="flex items-center gap-1 mb-1.5 flex-wrap">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
            {modelProvider === 'AWS Bedrock' ? '☁️ Bedrock' : modelProvider === 'OpenAI' ? '🟢 OpenAI' : modelProvider === 'Anthropic' ? '🟠 Anthropic' : modelProvider === 'Google' ? '🔵 Google' : '🔧 ' + modelProvider}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium truncate max-w-[120px]">
            {modelName}
          </span>
        </div>

        {/* System prompt preview */}
        {promptPreview ? (
          <p className="text-[9px] text-gray-400 italic line-clamp-1 mb-1.5 leading-relaxed border-l-2 border-gray-200 pl-1.5">
            {promptPreview}
          </p>
        ) : (
          <p className="text-[9px] text-red-400 italic mb-1.5 border-l-2 border-red-200 pl-1.5">
            No system prompt set
          </p>
        )}

        {/* Feature badges — compact grid */}
        <div className="flex flex-wrap gap-0.5 mb-1.5">
          {streaming && (
            <span className="inline-flex items-center gap-0.5 text-[8px] px-1 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
              <Zap className="w-2 h-2" />Stream
            </span>
          )}
          {hasGuardrails && (
            <span className="inline-flex items-center gap-0.5 text-[8px] px-1 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              <Shield className="w-2 h-2" />Safe
            </span>
          )}
          {otelEnabled && (
            <span className="inline-flex items-center gap-0.5 text-[8px] px-1 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
              <Activity className="w-2 h-2" />Trace
            </span>
          )}
          {memoryEnabled && (
            <span className="inline-flex items-center gap-0.5 text-[8px] px-1 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">
              <Brain className="w-2 h-2" />{memoryType === 'bedrock_kb' ? 'RAG' : memoryType === 'mem0' ? 'Mem0' : 'Mem'}
            </span>
          )}
          {thinkingEnabled && (
            <span className="text-[8px] px-1 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">💭 Think</span>
          )}
          {goalLoopEnabled && (
            <span className="text-[8px] px-1 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">🔄 Loop</span>
          )}
          {humanInLoopEnabled && (
            <span className="text-[8px] px-1 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">👤 HITL</span>
          )}
          {agentSopEnabled && (
            <span className="text-[8px] px-1 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">📋 SOP</span>
          )}
        </div>

        {/* Config summary line */}
        {activeFeatures.length > 0 && (
          <div className="text-[8px] text-gray-400 truncate">
            {activeFeatures.join(' · ')}
          </div>
        )}

        {/* Temperature + MaxTokens bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex items-center gap-1 flex-1">
            <span className="text-[8px] text-gray-400">T:</span>
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                style={{ width: `${(temperature as number) * 100}%` }}
              />
            </div>
            <span className="text-[8px] text-gray-500 font-mono w-5 text-right">{temperature}</span>
          </div>
          <span className="text-[8px] text-gray-400">{(maxTokens / 1000).toFixed(0)}K</span>
        </div>
      </div>

      {/* Input Handle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center">
        <span className="text-[8px] font-medium text-green-600 bg-green-50 px-1.5 rounded-full border border-green-200 mb-0.5">Input</span>
        <Handle
          type="target"
          position={Position.Top}
          id="user-input"
          className="!bg-green-500 !w-3 !h-3 !border-2 !border-white !relative !transform-none"
          style={{ position: 'relative', top: 0, left: 0 }}
        />
      </div>

      {/* Tool Handle (left) */}
      <div className="absolute left-0 top-[40%] -translate-x-full -translate-y-1/2 flex items-center">
        <span className="text-[8px] font-medium text-orange-600 bg-orange-50 px-1.5 rounded-full border border-orange-200 mr-0.5">Tools</span>
        <Handle
          type="target"
          position={Position.Left}
          id="tools"
          className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white !relative !transform-none"
          style={{ position: 'relative', left: 0, top: 0 }}
        />
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="orchestrator-input"
        className="!bg-purple-400 !w-3 !h-3 !border-2 !border-white !absolute"
        style={{ left: -6, top: '70%' }}
      />

      {/* Output Handle */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full flex flex-col items-center">
        <Handle
          type="source"
          position={Position.Bottom}
          id="output"
          className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-white !relative !transform-none"
          style={{ position: 'relative', bottom: 0, left: 0 }}
        />
        <span className="text-[8px] font-medium text-indigo-600 bg-indigo-50 px-1.5 rounded-full border border-indigo-200 mt-0.5">Output</span>
      </div>
    </div>
  );
}
