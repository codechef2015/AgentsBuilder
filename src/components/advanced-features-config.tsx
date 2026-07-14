/**
 * AdvancedFeaturesConfig — Memory Manager, Callback Handler, Bidirectional Streaming
 *
 * Provides UI for configuring:
 * 1. Memory Manager (Bedrock Knowledge Base, Mem0, Custom)
 * 2. Callback Handler (None, Printing, Custom)
 * 3. Bidirectional Streaming / Voice Agent toggle
 *
 * Architecture:
 * - UI only — codegen in `advanced-features-codegen.ts`
 * - No useEffect — derived state from props (React 19)
 * - Input validation via HTML attributes + codegen sanitization
 *
 * Security:
 * - Knowledge Base IDs alphanumeric only
 * - No API keys in component state — env var references
 */

import { ChevronDown, ChevronRight, Brain, Mic, Zap } from 'lucide-react';
import { useState } from 'react';

interface AdvancedFeaturesConfigProps {
  data: Record<string, any>;
  onUpdate: (updates: Record<string, any>) => void;
}

function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
  badge,
  icon: Icon,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border border-gray-200 rounded-md">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          )}
          {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" />}
          <span className="text-xs font-medium text-gray-700">{title}</span>
        </div>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
            {badge}
          </span>
        )}
      </button>
      {expanded && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
}

export function AdvancedFeaturesConfig({ data, onUpdate }: AdvancedFeaturesConfigProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  const hasAdvanced = data.memoryEnabled || data.bidirectionalStreamingEnabled;

  return (
    <div className="border-t pt-4 mt-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-violet-600" />
        <h4 className="text-sm font-semibold text-gray-800">Advanced Features</h4>
        {hasAdvanced && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
            Active
          </span>
        )}
      </div>

      {/* Memory Manager */}
      <CollapsibleSection
        title="Memory Manager"
        expanded={expandedSections['memory'] ?? false}
        onToggle={() => toggleSection('memory')}
        badge={data.memoryEnabled ? 'ON' : undefined}
        icon={Brain}
      >
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.memoryEnabled ?? false}
              onChange={(e) => handleChange('memoryEnabled', e.target.checked)}
              className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-xs font-medium text-gray-600">
              Enable Persistent Memory
            </span>
          </label>

          <p className="text-xs text-gray-400">
            Gives the agent access to a persistent knowledge store for RAG or
            conversational memory across sessions.
          </p>

          {data.memoryEnabled && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Memory Type
                </label>
                <select
                  value={data.memoryType || 'bedrock_kb'}
                  onChange={(e) => handleChange('memoryType', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="bedrock_kb">Bedrock Knowledge Base (RAG)</option>
                  <option value="mem0">Mem0 (Conversational Memory)</option>
                  <option value="custom">Custom Memory Store</option>
                </select>
              </div>

              {data.memoryType === 'bedrock_kb' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Knowledge Base ID
                    </label>
                    <input
                      type="text"
                      value={data.memoryKnowledgeBaseId || ''}
                      onChange={(e) => handleChange('memoryKnowledgeBaseId', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500 font-mono"
                      placeholder="kb-xxxxxxxxxx"
                      pattern="[a-zA-Z0-9\-_]+"
                    />
                    <p className="text-xs text-gray-400 mt-0.5">
                      From Bedrock console. Uses <code className="text-xs">KNOWLEDGE_BASE_ID</code> env var.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Region
                    </label>
                    <select
                      value={data.memoryRegion || 'us-east-1'}
                      onChange={(e) => handleChange('memoryRegion', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500"
                    >
                      <option value="us-east-1">us-east-1</option>
                      <option value="us-west-2">us-west-2</option>
                      <option value="eu-west-1">eu-west-1</option>
                      <option value="ap-northeast-1">ap-northeast-1</option>
                      <option value="ap-southeast-1">ap-southeast-1</option>
                    </select>
                  </div>
                </>
              )}

              {data.memoryType === 'mem0' && (
                <div className="bg-violet-50 border border-violet-200 rounded p-2">
                  <p className="text-xs text-violet-700">
                    Mem0 provides persistent conversational memory. The agent remembers
                    context across conversations.
                  </p>
                  <p className="text-xs text-violet-600 mt-1">
                    Set <code className="text-xs font-mono">MEM0_API_KEY</code> env var for cloud mode.
                  </p>
                </div>
              )}

              {data.memoryType === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Custom Import Statement
                  </label>
                  <input
                    type="text"
                    value={data.memoryCustomImport || ''}
                    onChange={(e) => handleChange('memoryCustomImport', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500 font-mono"
                    placeholder="from my_memory import custom_memory_tool"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Callback Handler */}
      <CollapsibleSection
        title="Callback Handler"
        expanded={expandedSections['callback'] ?? false}
        onToggle={() => toggleSection('callback')}
        badge={data.callbackHandlerType && data.callbackHandlerType !== 'none' ? data.callbackHandlerType : undefined}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Handler Type
            </label>
            <select
              value={data.callbackHandlerType || 'none'}
              onChange={(e) => handleChange('callbackHandlerType', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
            >
              <option value="none">None (for programmatic use)</option>
              <option value="printing">PrintingCallbackHandler (console output)</option>
              <option value="custom">Custom Handler</option>
            </select>
            <p className="text-xs text-gray-400 mt-0.5">
              Controls how agent output is streamed to the user during execution.
            </p>
          </div>

          {data.callbackHandlerType === 'custom' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Custom Handler Expression
              </label>
              <input
                type="text"
                value={data.callbackHandlerCustomCode || ''}
                onChange={(e) => handleChange('callbackHandlerCustomCode', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500 font-mono"
                placeholder="MyCustomHandler()"
              />
              <p className="text-xs text-gray-400 mt-0.5">
                Python expression that creates your handler instance.
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Bidirectional Streaming */}
      <CollapsibleSection
        title="Bidirectional Streaming (Voice)"
        expanded={expandedSections['bidir'] ?? false}
        onToggle={() => toggleSection('bidir')}
        badge={data.bidirectionalStreamingEnabled ? 'ON' : undefined}
        icon={Mic}
      >
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.bidirectionalStreamingEnabled ?? false}
              onChange={(e) => handleChange('bidirectionalStreamingEnabled', e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-xs font-medium text-gray-600">
              Enable Bidirectional Streaming
            </span>
          </label>

          <p className="text-xs text-gray-400">
            Enables real-time voice/audio communication with the agent via WebSocket.
            Requires the <code className="text-xs font-mono">strands-agents[voice]</code> extra.
          </p>

          {data.bidirectionalStreamingEnabled && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Transport
                </label>
                <select
                  value={data.bidirectionalStreamingProvider || 'websocket'}
                  onChange={(e) => handleChange('bidirectionalStreamingProvider', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="websocket">WebSocket (recommended)</option>
                  <option value="webrtc">WebRTC (peer-to-peer)</option>
                </select>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded p-2">
                <p className="text-xs text-pink-700 font-medium">Requirements:</p>
                <ul className="text-xs text-pink-600 list-disc list-inside space-y-0.5 mt-1">
                  <li><code className="font-mono">pip install &quot;strands-agents[voice]&quot;</code></li>
                  <li>Audio input/output device access</li>
                  <li>Model with real-time audio support (e.g., Nova Sonic)</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}
