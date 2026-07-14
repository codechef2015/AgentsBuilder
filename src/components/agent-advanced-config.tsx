/**
 * AgentAdvancedConfig — Agent-level configuration beyond model provider
 * 
 * Handles:
 * - Retry Strategy (max_attempts, initial_delay, max_delay)
 * - Conversation Manager (sliding_window, summarizing, null)
 * - Session Manager (file, s3, none)
 * - Invocation Limits (max_turns, total_tokens)
 * - Structured Output (Pydantic model schema)
 * 
 * Based on Strands Agents SDK:
 * https://strandsagents.com/docs/user-guide/concepts/agents/
 */

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface AgentAdvancedConfigProps {
  data: any;
  onUpdate: (updates: Record<string, any>) => void;
}

export function AgentAdvancedConfig({ data, onUpdate }: AgentAdvancedConfigProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  return (
    <div className="border-t pt-4 mt-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-800 mb-2">Agent Configuration</h4>

      {/* Invocation Limits */}
      <CollapsibleSection
        title="Invocation Limits"
        expanded={expandedSections['limits']}
        onToggle={() => toggleSection('limits')}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Max Turns
            </label>
            <input
              type="number"
              value={data.maxTurns ?? ''}
              onChange={(e) => handleChange('maxTurns', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Unlimited (default)"
              min="1"
              max="100"
            />
            <p className="text-xs text-gray-400 mt-0.5">
              Maximum agent loop iterations before stopping
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Total Token Budget
            </label>
            <input
              type="number"
              value={data.totalTokenBudget ?? ''}
              onChange={(e) => handleChange('totalTokenBudget', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Unlimited (default)"
              min="1000"
              step="1000"
            />
            <p className="text-xs text-gray-400 mt-0.5">
              Total token budget across all turns
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Retry Strategy */}
      <CollapsibleSection
        title="Retry Strategy"
        expanded={expandedSections['retry']}
        onToggle={() => toggleSection('retry')}
      >
        <div className="space-y-3">
          <div>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={data.retryEnabled ?? true}
                onChange={(e) => handleChange('retryEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-gray-600">Enable Retries</span>
            </label>
          </div>

          {(data.retryEnabled ?? true) && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Max Attempts: {data.retryMaxAttempts || 6}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={data.retryMaxAttempts || 6}
                  onChange={(e) => handleChange('retryMaxAttempts', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1 (no retry)</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Initial Delay (seconds): {data.retryInitialDelay || 4}
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={data.retryInitialDelay || 4}
                  onChange={(e) => handleChange('retryInitialDelay', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1s</span>
                  <span>30s</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Max Delay (seconds): {data.retryMaxDelay || 128}
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={data.retryMaxDelay || 128}
                  onChange={(e) => handleChange('retryMaxDelay', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>10s</span>
                  <span>300s</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Conversation Manager */}
      <CollapsibleSection
        title="Conversation Manager"
        expanded={expandedSections['conversation']}
        onToggle={() => toggleSection('conversation')}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Type
            </label>
            <select
              value={data.conversationManager || 'default'}
              onChange={(e) => handleChange('conversationManager', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="default">Default (SDK managed)</option>
              <option value="sliding_window">Sliding Window</option>
              <option value="summarizing">Summarizing</option>
              <option value="null">None (no history management)</option>
            </select>
          </div>

          {data.conversationManager === 'sliding_window' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Window Size (messages)
              </label>
              <input
                type="number"
                value={data.conversationWindowSize || 20}
                onChange={(e) => handleChange('conversationWindowSize', parseInt(e.target.value))}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="2"
                max="200"
              />
              <p className="text-xs text-gray-400 mt-0.5">
                Number of messages to keep in context window
              </p>
            </div>
          )}

          {data.conversationManager === 'summarizing' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Max Summary Tokens
                </label>
                <input
                  type="number"
                  value={data.conversationSummaryTokens || 2000}
                  onChange={(e) => handleChange('conversationSummaryTokens', parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="100"
                  max="10000"
                  step="100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Preserve Recent Messages
                </label>
                <input
                  type="number"
                  value={data.conversationPreserveRecent || 4}
                  onChange={(e) => handleChange('conversationPreserveRecent', parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="20"
                />
                <p className="text-xs text-gray-400 mt-0.5">
                  Number of recent messages to always keep (not summarized)
                </p>
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Session Manager */}
      <CollapsibleSection
        title="Session Manager"
        expanded={expandedSections['session']}
        onToggle={() => toggleSection('session')}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Type
            </label>
            <select
              value={data.sessionManager || 'none'}
              onChange={(e) => handleChange('sessionManager', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">None (stateless)</option>
              <option value="file">File-based (local filesystem)</option>
              <option value="s3">S3 (cloud persistence)</option>
            </select>
          </div>

          {data.sessionManager === 'file' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Storage Directory
              </label>
              <input
                type="text"
                value={data.sessionDirectory || ''}
                onChange={(e) => handleChange('sessionDirectory', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="./sessions (default)"
              />
            </div>
          )}

          {data.sessionManager === 's3' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  S3 Bucket
                </label>
                <input
                  type="text"
                  value={data.sessionS3Bucket || ''}
                  onChange={(e) => handleChange('sessionS3Bucket', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="my-sessions-bucket"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  S3 Prefix (Optional)
                </label>
                <input
                  type="text"
                  value={data.sessionS3Prefix || ''}
                  onChange={(e) => handleChange('sessionS3Prefix', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="agents/sessions/"
                />
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Structured Output */}
      <CollapsibleSection
        title="Structured Output"
        expanded={expandedSections['structured']}
        onToggle={() => toggleSection('structured')}
      >
        <div className="space-y-3">
          <div>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={data.structuredOutputEnabled || false}
                onChange={(e) => handleChange('structuredOutputEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-gray-600">Enable Structured Output</span>
            </label>
            <p className="text-xs text-gray-400">
              Force the agent to return responses matching a Pydantic schema
            </p>
          </div>

          {data.structuredOutputEnabled && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pydantic Model (Python class)
              </label>
              <textarea
                value={data.structuredOutputSchema || ''}
                onChange={(e) => handleChange('structuredOutputSchema', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder={`class ResponseSchema(BaseModel):
    answer: str
    confidence: float
    sources: list[str]`}
                rows={6}
              />
              <p className="text-xs text-gray-400 mt-0.5">
                Define a Pydantic BaseModel class. The agent will return typed data matching this schema.
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}

// --- Collapsible Section Helper ---

interface CollapsibleSectionProps {
  title: string;
  expanded?: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, expanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-xs font-medium text-gray-700">{title}</span>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
        )}
      </button>
      {expanded && (
        <div className="px-3 py-3 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
