/**
 * GuardrailsConfig — Agent safety & guardrails configuration panel
 *
 * Provides UI for configuring:
 * 1. Bedrock Guardrails (guardrail_id, version, trace, input/output redaction)
 * 2. Agent Control Plugin (runtime guardrails via Galileo)
 * 3. Custom Hook Guardrails (notify-only / blocking mode)
 *
 * Architecture:
 * - This component handles ONLY UI state and user input
 * - Code generation logic lives in `guardrails-codegen.ts` (separation of concerns)
 * - No useEffect — all state is derived directly from props (React 19 pattern)
 * - Input sanitization happens in codegen layer, not UI layer
 *
 * OWASP Compliance:
 * - Guardrail IDs are validated (alphanumeric + hyphens/underscores only)
 * - No secrets stored in component state (uses env var references in codegen)
 * - Generated code references env vars for sensitive configuration
 *
 * Based on Strands Agents SDK:
 * https://strandsagents.com/docs/user-guide/safety-security/guardrails/
 */

import { ChevronDown, ChevronRight, Shield, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface GuardrailsConfigProps {
  data: Record<string, any>;
  onUpdate: (updates: Record<string, any>) => void;
}

/** Collapsible section used across the guardrails panel */
function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
  badge,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
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
          <span className="text-xs font-medium text-gray-700">{title}</span>
        </div>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
            {badge}
          </span>
        )}
      </button>
      {expanded && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
}

export function GuardrailsConfig({ data, onUpdate }: GuardrailsConfigProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  // Derived state — no useEffect needed (React 19 pattern)
  const hasAnyGuardrail =
    data.bedrockGuardrailEnabled ||
    data.agentControlEnabled ||
    data.customGuardrailHookEnabled;

  return (
    <div className="border-t pt-4 mt-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-red-600" />
        <h4 className="text-sm font-semibold text-gray-800">Guardrails & Safety</h4>
        {hasAnyGuardrail && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
            Active
          </span>
        )}
      </div>

      {!hasAnyGuardrail && (
        <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            No guardrails configured. Consider enabling at least one safety mechanism
            for production agents.
          </span>
        </div>
      )}

      {/* Bedrock Guardrails */}
      <CollapsibleSection
        title="Bedrock Guardrails"
        expanded={expandedSections['bedrock'] ?? false}
        onToggle={() => toggleSection('bedrock')}
        badge={data.bedrockGuardrailEnabled ? 'ON' : undefined}
      >
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.bedrockGuardrailEnabled ?? false}
              onChange={(e) => handleChange('bedrockGuardrailEnabled', e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-xs font-medium text-gray-600">
              Enable Bedrock Guardrails
            </span>
          </label>

          {data.bedrockGuardrailEnabled && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Guardrail ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.bedrockGuardrailId || ''}
                  onChange={(e) => handleChange('bedrockGuardrailId', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 font-mono"
                  placeholder="your-guardrail-id"
                  pattern="[a-zA-Z0-9\-_]+"
                  title="Only letters, numbers, hyphens, and underscores"
                />
                <p className="text-xs text-gray-400 mt-0.5">
                  From AWS Bedrock console → Guardrails. Uses env var <code className="text-xs">BEDROCK_GUARDRAIL_ID</code> at runtime.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Guardrail Version
                </label>
                <input
                  type="text"
                  value={data.bedrockGuardrailVersion || '1'}
                  onChange={(e) => handleChange('bedrockGuardrailVersion', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 font-mono"
                  placeholder="1"
                  pattern="[0-9]+"
                />
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={data.bedrockGuardrailTrace ?? false}
                  onChange={(e) => handleChange('bedrockGuardrailTrace', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-xs text-gray-600">Enable trace (debug info)</span>
              </label>

              <div className="border-t pt-2 mt-2">
                <p className="text-xs font-medium text-gray-600 mb-2">Input Redaction</p>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={data.bedrockGuardrailRedactInput ?? true}
                    onChange={(e) => handleChange('bedrockGuardrailRedactInput', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs text-gray-600">Redact blocked input from history</span>
                </label>

                {(data.bedrockGuardrailRedactInput ?? true) && (
                  <input
                    type="text"
                    value={data.bedrockGuardrailRedactInputMessage || ''}
                    onChange={(e) => handleChange('bedrockGuardrailRedactInputMessage', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="(default message)"
                  />
                )}
              </div>

              <div className="border-t pt-2 mt-2">
                <p className="text-xs font-medium text-gray-600 mb-2">Output Redaction</p>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={data.bedrockGuardrailRedactOutput ?? false}
                    onChange={(e) => handleChange('bedrockGuardrailRedactOutput', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs text-gray-600">Redact blocked output from history</span>
                </label>

                {data.bedrockGuardrailRedactOutput && (
                  <input
                    type="text"
                    value={data.bedrockGuardrailRedactOutputMessage || ''}
                    onChange={(e) => handleChange('bedrockGuardrailRedactOutputMessage', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="(default message)"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Agent Control */}
      <CollapsibleSection
        title="Agent Control (Runtime Guardrails)"
        expanded={expandedSections['agentControl'] ?? false}
        onToggle={() => toggleSection('agentControl')}
        badge={data.agentControlEnabled ? 'ON' : undefined}
      >
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.agentControlEnabled ?? false}
              onChange={(e) => handleChange('agentControlEnabled', e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-xs font-medium text-gray-600">
              Enable Agent Control Plugin
            </span>
          </label>

          <p className="text-xs text-gray-400">
            Open-source runtime guardrails by Galileo. Evaluates inputs/outputs against
            configurable rules without code changes.
          </p>

          {data.agentControlEnabled && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Agent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.agentControlAgentName || ''}
                  onChange={(e) => handleChange('agentControlAgentName', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 font-mono"
                  placeholder="my-agent"
                />
                <p className="text-xs text-gray-400 mt-0.5">
                  Identifies this agent in the Agent Control dashboard
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Server URL
                </label>
                <input
                  type="url"
                  value={data.agentControlServerUrl || ''}
                  onChange={(e) => handleChange('agentControlServerUrl', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 font-mono"
                  placeholder="http://localhost:8080"
                />
                <p className="text-xs text-gray-400 mt-0.5">
                  Agent Control server URL. Uses <code className="text-xs">AGENT_CONTROL_URL</code> env var.
                </p>
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Custom Hook Guardrails */}
      <CollapsibleSection
        title="Custom Guardrail Hook"
        expanded={expandedSections['customHook'] ?? false}
        onToggle={() => toggleSection('customHook')}
        badge={data.customGuardrailHookEnabled ? 'ON' : undefined}
      >
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.customGuardrailHookEnabled ?? false}
              onChange={(e) => handleChange('customGuardrailHookEnabled', e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-xs font-medium text-gray-600">
              Enable Custom Guardrail Hook
            </span>
          </label>

          <p className="text-xs text-gray-400">
            Generates a HookProvider class that validates content via Bedrock&apos;s
            ApplyGuardrail API. Choose notify-only (shadow) for monitoring or blocking for enforcement.
          </p>

          {data.customGuardrailHookEnabled && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Mode
                </label>
                <select
                  value={data.customGuardrailHookMode || 'notify_only'}
                  onChange={(e) => handleChange('customGuardrailHookMode', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="notify_only">Notify Only (Shadow Mode)</option>
                  <option value="blocking">Blocking (Enforce)</option>
                </select>
                <p className="text-xs text-gray-400 mt-0.5">
                  {data.customGuardrailHookMode === 'blocking'
                    ? '⚠️ Will raise ValueError on violations — agent execution stops'
                    : '✓ Logs violations without blocking — safe for rollout'}
                </p>
              </div>

              {!data.bedrockGuardrailId && (
                <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    Configure a Guardrail ID in the Bedrock Guardrails section above.
                    The custom hook uses the same guardrail for validation.
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}
