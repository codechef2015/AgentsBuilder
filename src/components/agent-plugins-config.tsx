/**
 * AgentPluginsConfig — Goal Loop, Human-in-the-Loop, Community Tools
 *
 * Covers remaining Strands SDK features not yet configurable:
 * 1. Goal Loop Plugin — autonomous goal-driven iteration
 * 2. Human-in-the-Loop — intervention/approval gates
 * 3. Community Tools Catalog — browse & add strands-tools packages
 * 4. MCP Instrumentation — OTEL tracing for MCP tool calls
 *
 * Each field includes a HelpTooltip explaining its purpose.
 *
 * Architecture:
 * - UI only — codegen in `plugins-codegen.ts`
 * - No useEffect — derived state (React 19)
 * - All tooltips reference official Strands docs URLs
 */

import { ChevronDown, ChevronRight, RefreshCw, UserCheck, Package, Gauge } from 'lucide-react';
import { useState } from 'react';
import { HelpTooltip, FieldLabel } from './ui/help-tooltip';

interface AgentPluginsConfigProps {
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
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
            {badge}
          </span>
        )}
      </button>
      {expanded && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
}

/** Available community tools from strands-tools package */
const COMMUNITY_TOOLS = [
  { name: 'calculator', description: 'Basic arithmetic operations', category: 'Utility' },
  { name: 'file_read', description: 'Read files from filesystem', category: 'File I/O' },
  { name: 'file_write', description: 'Write content to files', category: 'File I/O' },
  { name: 'shell', description: 'Execute shell commands', category: 'System' },
  { name: 'current_time', description: 'Get current date/time', category: 'Utility' },
  { name: 'http_request', description: 'Make HTTP requests (GET, POST, etc.)', category: 'Network' },
  { name: 'editor', description: 'Edit files with search/replace', category: 'File I/O' },
  { name: 'retrieve', description: 'Retrieve from Bedrock Knowledge Base (RAG)', category: 'Memory' },
  { name: 'mem0_memory', description: 'Persistent conversational memory via Mem0', category: 'Memory' },
  { name: 'workflow', description: 'DAG-based task workflow execution', category: 'Multi-Agent' },
  { name: 'python_repl', description: 'Execute Python code in sandboxed REPL', category: 'Code' },
  { name: 'use_llm', description: 'Call another LLM as a tool', category: 'AI' },
  { name: 'journal', description: 'Maintain a persistent journal/log', category: 'Utility' },
  { name: 'slack', description: 'Send messages to Slack channels', category: 'Communication' },
  { name: 'github', description: 'Interact with GitHub repos and issues', category: 'Development' },
  { name: 'cron', description: 'Schedule recurring tasks', category: 'System' },
  { name: 'environment', description: 'Read environment variables safely', category: 'System' },
  { name: 'swarm_handoff', description: 'Hand off control to another swarm agent', category: 'Multi-Agent' },
  { name: 'load_tool', description: 'Dynamically load additional tools', category: 'Meta' },
];

export function AgentPluginsConfig({ data, onUpdate }: AgentPluginsConfigProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [toolSearch, setToolSearch] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  // Community tools filtering — derived state, no useEffect
  const filteredTools = toolSearch
    ? COMMUNITY_TOOLS.filter(
        (t) =>
          t.name.includes(toolSearch.toLowerCase()) ||
          t.description.toLowerCase().includes(toolSearch.toLowerCase()) ||
          t.category.toLowerCase().includes(toolSearch.toLowerCase())
      )
    : COMMUNITY_TOOLS;

  const selectedCommunityTools: string[] = data.communityTools || [];

  const toggleCommunityTool = (toolName: string) => {
    const current = [...selectedCommunityTools];
    const index = current.indexOf(toolName);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(toolName);
    }
    handleChange('communityTools', current);
  };

  const hasPlugins =
    data.goalLoopEnabled || data.humanInLoopEnabled || selectedCommunityTools.length > 0;

  return (
    <div className="border-t pt-4 mt-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-4 h-4 text-indigo-600" />
        <h4 className="text-sm font-semibold text-gray-800">Plugins & Tools</h4>
        {hasPlugins && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
            Active
          </span>
        )}
      </div>

      {/* Goal Loop Plugin */}
      <CollapsibleSection
        title="Goal Loop Plugin"
        expanded={expandedSections['goalLoop'] ?? false}
        onToggle={() => toggleSection('goalLoop')}
        badge={data.goalLoopEnabled ? 'ON' : undefined}
        icon={RefreshCw}
      >
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.goalLoopEnabled ?? false}
              onChange={(e) => handleChange('goalLoopEnabled', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-gray-600">
              Enable Goal Loop
            </span>
            <HelpTooltip
              text="Goal Loop makes the agent autonomously iterate toward a goal, re-evaluating progress after each tool call until the goal is achieved or max iterations reached."
              docUrl="https://strandsagents.com/docs/user-guide/concepts/agents/"
            />
          </label>

          {data.goalLoopEnabled && (
            <>
              <div>
                <FieldLabel
                  label="Max Goal Iterations"
                  tooltip="Maximum number of autonomous iterations the agent will perform before stopping. Higher values allow more complex goals but use more tokens."
                />
                <input
                  type="number"
                  value={data.goalLoopMaxIterations || 10}
                  onChange={(e) => handleChange('goalLoopMaxIterations', parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <FieldLabel
                  label="Goal Evaluation Prompt"
                  tooltip="Custom prompt used to evaluate whether the goal has been achieved. Leave empty to use the agent's default judgment."
                />
                <textarea
                  value={data.goalLoopEvalPrompt || ''}
                  onChange={(e) => handleChange('goalLoopEvalPrompt', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Evaluate if the goal is complete. Respond DONE if finished, CONTINUE if more work needed."
                  rows={3}
                />
              </div>

              <div>
                <FieldLabel
                  label="Stop Condition"
                  tooltip="Keyword in agent response that signals goal completion and stops the loop."
                />
                <input
                  type="text"
                  value={data.goalLoopStopCondition || 'DONE'}
                  onChange={(e) => handleChange('goalLoopStopCondition', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                  placeholder="DONE"
                />
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Human-in-the-Loop */}
      <CollapsibleSection
        title="Human-in-the-Loop"
        expanded={expandedSections['hitl'] ?? false}
        onToggle={() => toggleSection('hitl')}
        badge={data.humanInLoopEnabled ? 'ON' : undefined}
        icon={UserCheck}
      >
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.humanInLoopEnabled ?? false}
              onChange={(e) => handleChange('humanInLoopEnabled', e.target.checked)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-xs font-medium text-gray-600">
              Enable Human Approval Gates
            </span>
            <HelpTooltip
              text="Pauses agent execution before certain tool calls and waits for human approval. Critical for high-risk actions like sending emails, making payments, or modifying production systems."
              docUrl="https://strandsagents.com/docs/user-guide/concepts/agents/hooks/"
            />
          </label>

          {data.humanInLoopEnabled && (
            <>
              <div>
                <FieldLabel
                  label="Approval Mode"
                  tooltip="'All tools' requires approval for every tool call. 'Specific tools' only gates selected tools. 'High-risk only' uses heuristics to identify dangerous operations."
                />
                <select
                  value={data.humanInLoopMode || 'specific'}
                  onChange={(e) => handleChange('humanInLoopMode', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All tool calls</option>
                  <option value="specific">Specific tools only</option>
                  <option value="high_risk">High-risk tools (auto-detected)</option>
                </select>
              </div>

              {data.humanInLoopMode === 'specific' && (
                <div>
                  <FieldLabel
                    label="Tools Requiring Approval"
                    tooltip="Comma-separated list of tool function names that require human approval before execution."
                  />
                  <input
                    type="text"
                    value={data.humanInLoopTools || ''}
                    onChange={(e) => handleChange('humanInLoopTools', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 font-mono"
                    placeholder="shell, file_write, http_request"
                  />
                </div>
              )}

              <div>
                <FieldLabel
                  label="Timeout (seconds)"
                  tooltip="How long to wait for human approval before automatically denying the tool call. Set 0 for no timeout (waits indefinitely)."
                />
                <input
                  type="number"
                  value={data.humanInLoopTimeout || 300}
                  onChange={(e) => handleChange('humanInLoopTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  min="0"
                  max="3600"
                />
              </div>

              <div>
                <FieldLabel
                  label="On Timeout Action"
                  tooltip="What happens when approval times out. 'Deny' blocks the tool call. 'Allow' auto-approves (less safe). 'Skip' continues without the tool result."
                />
                <select
                  value={data.humanInLoopTimeoutAction || 'deny'}
                  onChange={(e) => handleChange('humanInLoopTimeoutAction', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="deny">Deny (block tool call)</option>
                  <option value="allow">Allow (auto-approve)</option>
                  <option value="skip">Skip (continue without result)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* MCP Instrumentation */}
      <CollapsibleSection
        title="MCP Instrumentation"
        expanded={expandedSections['mcpOtel'] ?? false}
        onToggle={() => toggleSection('mcpOtel')}
        badge={data.mcpInstrumentationEnabled ? 'ON' : undefined}
        icon={Gauge}
      >
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.mcpInstrumentationEnabled ?? false}
              onChange={(e) => handleChange('mcpInstrumentationEnabled', e.target.checked)}
              className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="text-xs font-medium text-gray-600">
              Enable MCP Tracing
            </span>
            <HelpTooltip
              text="Adds OpenTelemetry spans around MCP tool calls, capturing latency, errors, and tool parameters. Requires OTEL to be enabled in Observability settings."
              docUrl="https://strandsagents.com/docs/user-guide/observability-evaluation/observability/"
            />
          </label>

          {data.mcpInstrumentationEnabled && (
            <div className="bg-cyan-50 border border-cyan-200 rounded p-2">
              <p className="text-xs text-cyan-700">
                MCP tool calls will emit OTEL spans with attributes: <code className="font-mono text-[10px]">mcp.tool.name</code>, <code className="font-mono text-[10px]">mcp.server.name</code>, <code className="font-mono text-[10px]">mcp.duration_ms</code>
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Community Tools Catalog */}
      <CollapsibleSection
        title="Community Tools"
        expanded={expandedSections['communityTools'] ?? false}
        onToggle={() => toggleSection('communityTools')}
        badge={selectedCommunityTools.length > 0 ? `${selectedCommunityTools.length}` : undefined}
        icon={Package}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            <p className="text-xs text-gray-400">
              Browse available tools from <code className="font-mono text-[10px]">strands-tools</code> package.
            </p>
            <HelpTooltip
              text="Community tools are pre-built tool functions from the strands-tools package. Select tools to add them to your agent's capabilities. They are imported automatically in generated code."
              docUrl="https://strandsagents.com/docs/user-guide/concepts/tools/community-tools/"
            />
          </div>

          <div>
            <input
              type="text"
              value={toolSearch}
              onChange={(e) => setToolSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search tools..."
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredTools.map((tool) => (
              <label
                key={tool.name}
                className={`flex items-start gap-2 p-1.5 rounded cursor-pointer transition-colors ${
                  selectedCommunityTools.includes(tool.name)
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCommunityTools.includes(tool.name)}
                  onChange={() => toggleCommunityTool(tool.name)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono font-medium text-gray-800">{tool.name}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-gray-100 text-gray-500">{tool.category}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{tool.description}</p>
                </div>
              </label>
            ))}
          </div>

          {selectedCommunityTools.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">
                Selected: <span className="font-mono text-indigo-600">{selectedCommunityTools.join(', ')}</span>
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}
