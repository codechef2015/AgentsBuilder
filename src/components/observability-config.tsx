/**
 * ObservabilityConfig — Agent observability & SOPs configuration panel
 *
 * Provides UI for configuring:
 * 1. OpenTelemetry tracing (exporter type, endpoint, service name, sampling)
 * 2. Agent SOPs (markdown-based workflow definitions)
 *
 * Architecture:
 * - UI only — no business logic or code generation
 * - Code generation lives in `observability-codegen.ts`
 * - No useEffect — all derived state computed from props (React 19)
 * - Input validation via HTML pattern attributes + sanitization in codegen
 *
 * Security:
 * - OTEL endpoint validated (http/https/grpc schemes only)
 * - Auth headers never stored in component — env var reference only
 * - Service names alphanumeric + hyphens only
 */

import { ChevronDown, ChevronRight, Activity, FileText } from 'lucide-react';
import { useState } from 'react';

interface ObservabilityConfigProps {
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
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
            {badge}
          </span>
        )}
      </button>
      {expanded && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
}

export function ObservabilityConfig({ data, onUpdate }: ObservabilityConfigProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  // Derived state
  const hasObservability = data.otelEnabled || data.agentSopEnabled;

  return (
    <div className="border-t pt-4 mt-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-800">Observability & SOPs</h4>
        {hasObservability && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
            Active
          </span>
        )}
      </div>

      {/* OpenTelemetry Tracing */}
      <CollapsibleSection
        title="OpenTelemetry Tracing"
        expanded={expandedSections['otel'] ?? false}
        onToggle={() => toggleSection('otel')}
        badge={data.otelEnabled ? 'ON' : undefined}
        icon={Activity}
      >
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.otelEnabled ?? false}
              onChange={(e) => handleChange('otelEnabled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-medium text-gray-600">
              Enable OpenTelemetry Tracing
            </span>
          </label>

          <p className="text-xs text-gray-400">
            Strands SDK auto-instruments agent loops, tool calls, and model invocations
            when OTEL environment variables are set.
          </p>

          {data.otelEnabled && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Exporter Type
                </label>
                <select
                  value={data.otelExporterType || 'otlp_grpc'}
                  onChange={(e) => handleChange('otelExporterType', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="otlp_grpc">OTLP/gRPC (default)</option>
                  <option value="otlp_http">OTLP/HTTP</option>
                  <option value="console">Console (development)</option>
                  <option value="none">None (env var only)</option>
                </select>
              </div>

              {(data.otelExporterType === 'otlp_grpc' || data.otelExporterType === 'otlp_http' || !data.otelExporterType) && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Collector Endpoint
                  </label>
                  <input
                    type="url"
                    value={data.otelEndpoint || ''}
                    onChange={(e) => handleChange('otelEndpoint', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder={data.otelExporterType === 'otlp_http' ? 'http://localhost:4318' : 'http://localhost:4317'}
                  />
                  <p className="text-xs text-gray-400 mt-0.5">
                    OTEL collector URL. Overridden by <code className="text-xs">OTEL_EXPORTER_OTLP_ENDPOINT</code> env var.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  value={data.otelServiceName || ''}
                  onChange={(e) => handleChange('otelServiceName', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="strands-agent"
                  pattern="[a-zA-Z0-9\-_.]+"
                  title="Letters, numbers, hyphens, underscores, dots"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Sampling Rate: {(data.otelSamplingRate ?? 1.0).toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={data.otelSamplingRate ?? 1.0}
                  onChange={(e) => handleChange('otelSamplingRate', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0% (disabled)</span>
                  <span>100% (all traces)</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  1.0 = trace everything. Lower for high-throughput production.
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.otelHeaders ? true : false}
                    onChange={(e) => handleChange('otelHeaders', e.target.checked ? 'x-api-key=YOUR_KEY' : '')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600">
                    Requires auth headers (set via <code className="text-xs">OTEL_EXPORTER_OTLP_HEADERS</code>)
                  </span>
                </label>
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Agent SOPs */}
      <CollapsibleSection
        title="Agent SOP (Workflow Definition)"
        expanded={expandedSections['sop'] ?? false}
        onToggle={() => toggleSection('sop')}
        badge={data.agentSopEnabled ? 'ON' : undefined}
        icon={FileText}
      >
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.agentSopEnabled ?? false}
              onChange={(e) => handleChange('agentSopEnabled', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-xs font-medium text-gray-600">
              Enable Agent SOP
            </span>
          </label>

          <p className="text-xs text-gray-400">
            SOPs are markdown-based natural language workflow definitions that guide agent
            behavior. They are appended to the system prompt.
          </p>

          {data.agentSopEnabled && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  SOP Content (Markdown)
                </label>
                <textarea
                  value={data.agentSopContent || ''}
                  onChange={(e) => handleChange('agentSopContent', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 font-mono leading-relaxed"
                  placeholder={`## Standard Operating Procedure

### Step 1: Understand the Request
- Parse the user's intent
- Identify required tools

### Step 2: Execute
- Call appropriate tools
- Validate outputs

### Step 3: Respond
- Format results clearly
- Ask for clarification if needed

### Constraints
- Never expose PII
- Always cite sources`}
                  rows={12}
                />
                <p className="text-xs text-gray-400 mt-0.5">
                  Write in markdown. This will be appended to the agent&apos;s system prompt
                  as workflow guidance.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className="text-xs text-green-700 font-medium mb-1">SOP Tips:</p>
                <ul className="text-xs text-green-600 list-disc list-inside space-y-0.5">
                  <li>Use numbered steps for sequential workflows</li>
                  <li>Include constraints and guardrails</li>
                  <li>Reference available tools by name</li>
                  <li>Define success/failure criteria</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}
