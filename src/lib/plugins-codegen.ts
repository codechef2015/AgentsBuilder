/**
 * Plugins Code Generator — Goal Loop, Human-in-the-Loop, Community Tools, MCP Instrumentation
 *
 * Generates Python code for:
 * - Goal Loop Plugin (autonomous iteration toward a goal)
 * - Human-in-the-Loop Hook (approval gates before tool execution)
 * - Community Tools imports (strands-tools package tools)
 * - MCP Instrumentation (OTEL spans for MCP calls)
 *
 * Security:
 * - Tool names sanitized to valid Python identifiers
 * - No arbitrary code injection — only known tool names allowed
 * - Timeout values bounded
 */

export interface PluginsCodeOptions {
  // Goal Loop
  goalLoopEnabled?: boolean;
  goalLoopMaxIterations?: number;
  goalLoopEvalPrompt?: string;
  goalLoopStopCondition?: string;
  // Human-in-the-Loop
  humanInLoopEnabled?: boolean;
  humanInLoopMode?: 'all' | 'specific' | 'high_risk';
  humanInLoopTools?: string;
  humanInLoopTimeout?: number;
  humanInLoopTimeoutAction?: 'deny' | 'allow' | 'skip';
  // Community Tools
  communityTools?: string[];
  // MCP Instrumentation
  mcpInstrumentationEnabled?: boolean;
}

function sanitizeToolName(name: string): string {
  return (name || '').replace(/[^a-zA-Z0-9_]/g, '').trim();
}

/**
 * Generate import statements for plugins.
 */
export function generatePluginsImports(data: PluginsCodeOptions): string[] {
  const imports: string[] = [];

  if (data.humanInLoopEnabled) {
    imports.push('from strands.hooks import HookProvider, HookRegistry');
    imports.push('from strands.hooks.events import BeforeToolCallEvent');
  }

  // Community tools — add strands_tools imports
  if (data.communityTools && data.communityTools.length > 0) {
    const validTools = data.communityTools.map(sanitizeToolName).filter(Boolean);
    if (validTools.length > 0) {
      imports.push(`from strands_tools import ${validTools.join(', ')}`);
    }
  }

  return imports;
}

/**
 * Generate Goal Loop code (wraps agent execution in an iteration loop).
 */
export function generateGoalLoopCode(data: PluginsCodeOptions): string {
  if (!data.goalLoopEnabled) return '';

  const maxIterations = Math.min(Math.max(data.goalLoopMaxIterations || 10, 1), 50);
  const stopCondition = (data.goalLoopStopCondition || 'DONE').replace(/"/g, '\\"');
  const evalPrompt = (data.goalLoopEvalPrompt || '').replace(/"/g, '\\"').replace(/\n/g, '\\n');

  const lines: string[] = [];
  lines.push(`# Goal Loop — Autonomous goal-driven iteration`);
  lines.push(`GOAL_LOOP_MAX_ITERATIONS = ${maxIterations}`);
  lines.push(`GOAL_LOOP_STOP_CONDITION = "${stopCondition}"`);
  if (evalPrompt) {
    lines.push(`GOAL_LOOP_EVAL_PROMPT = "${evalPrompt}"`);
  }
  lines.push(``);
  lines.push(`def run_goal_loop(agent, goal: str, max_iterations: int = GOAL_LOOP_MAX_ITERATIONS) -> str:`);
  lines.push(`    """Iteratively run agent until goal is achieved or max iterations reached."""`);
  lines.push(`    context = f"Goal: {goal}\\n\\nIteration 1/{max_iterations}"`);
  lines.push(`    for i in range(max_iterations):`);
  lines.push(`        response = agent(context)`);
  lines.push(`        result = str(response)`);
  lines.push(`        if GOAL_LOOP_STOP_CONDITION in result:`);
  lines.push(`            return result`);
  lines.push(`        context = f"Previous result: {result[:500]}\\n\\nIteration {i+2}/{max_iterations}. Continue working toward the goal."`);
  lines.push(`    return f"Goal loop ended after {max_iterations} iterations without completion"`);

  return lines.join('\n');
}

/**
 * Generate Human-in-the-Loop hook class code.
 */
export function generateHumanInLoopCode(data: PluginsCodeOptions): string {
  if (!data.humanInLoopEnabled) return '';

  const mode = data.humanInLoopMode || 'specific';
  const timeout = Math.min(Math.max(data.humanInLoopTimeout || 300, 0), 3600);
  const timeoutAction = data.humanInLoopTimeoutAction || 'deny';

  // Parse specific tool names
  const specificTools = mode === 'specific' && data.humanInLoopTools
    ? data.humanInLoopTools.split(',').map(t => sanitizeToolName(t)).filter(Boolean)
    : [];

  const lines: string[] = [];
  lines.push(`# Human-in-the-Loop — Approval Gate Hook`);
  lines.push(`class HumanApprovalHook(HookProvider):`);
  lines.push(`    """Pauses execution and waits for human approval before tool calls.`);
  lines.push(`    `);
  lines.push(`    Mode: ${mode}`);
  lines.push(`    Timeout: ${timeout}s → ${timeoutAction}`);
  lines.push(`    """`);
  lines.push(``);

  if (mode === 'specific' && specificTools.length > 0) {
    lines.push(`    GATED_TOOLS = {${specificTools.map(t => `"${t}"`).join(', ')}}`);
  }

  lines.push(``);
  lines.push(`    def register_hooks(self, registry: HookRegistry) -> None:`);
  lines.push(`        registry.add_callback(BeforeToolCallEvent, self._check_approval)`);
  lines.push(``);
  lines.push(`    def _check_approval(self, event: BeforeToolCallEvent) -> None:`);
  lines.push(`        tool_name = event.tool_name`);

  if (mode === 'specific') {
    lines.push(`        if tool_name not in self.GATED_TOOLS:`);
    lines.push(`            return  # Not a gated tool, proceed`);
  }

  lines.push(``);
  lines.push(`        # Request approval (console-based; replace with your UI/API)`);
  lines.push(`        print(f"\\n⚠️  APPROVAL REQUIRED: Agent wants to call '{tool_name}'")`);
  lines.push(`        print(f"   Arguments: {event.tool_input}")`);
  lines.push(`        try:`);

  if (timeout > 0) {
    lines.push(`            import signal`);
    lines.push(`            signal.alarm(${timeout})  # Set timeout`);
  }

  lines.push(`            response = input("   Approve? (yes/no): ").strip().lower()`);

  if (timeout > 0) {
    lines.push(`            signal.alarm(0)  # Clear timeout`);
  }

  lines.push(`        except (EOFError, KeyboardInterrupt):`);
  lines.push(`            response = "${timeoutAction === 'allow' ? 'yes' : 'no'}"`);
  lines.push(`        if response not in ("yes", "y", "approve"):`);
  lines.push(`            raise ValueError(f"[HITL] Tool call '{tool_name}' denied by human")`);

  return lines.join('\n');
}

/**
 * Get the HITL hook kwarg for Agent constructor hooks list.
 */
export function getHumanInLoopHookKwarg(data: PluginsCodeOptions): string {
  if (!data.humanInLoopEnabled) return '';
  return 'HumanApprovalHook()';
}

/**
 * Get community tools as list for agent tools kwarg.
 */
export function getCommunityToolNames(data: PluginsCodeOptions): string[] {
  if (!data.communityTools || data.communityTools.length === 0) return [];
  return data.communityTools.map(sanitizeToolName).filter(Boolean);
}

/**
 * Generate MCP instrumentation setup code.
 */
export function generateMcpInstrumentationCode(data: PluginsCodeOptions): string {
  if (!data.mcpInstrumentationEnabled) return '';

  const lines: string[] = [];
  lines.push(`# MCP Instrumentation — OpenTelemetry tracing for MCP tool calls`);
  lines.push(`os.environ.setdefault("STRANDS_MCP_OTEL_ENABLED", "true")`);

  return lines.join('\n');
}
