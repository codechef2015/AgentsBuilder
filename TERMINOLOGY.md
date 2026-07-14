# AgenticBuilder — Terminology & Concepts

A reference guide for all terms, node types, and patterns used in AgenticBuilder. Each entry maps directly to the [Strands Agents SDK documentation](https://strandsagents.com/).

---

## Node Types

### Agent
**What it is:** A single AI agent powered by a Large Language Model (LLM). The core building block of any flow.

**What it does:** Receives a prompt, reasons about it, optionally calls tools, and generates a response. The agent loop handles tool selection, context management, and response generation automatically.

**Key config:** Model provider, model ID, system prompt, temperature, max tokens, streaming.

**Strands SDK:** `Agent(model=..., system_prompt=..., tools=[...])`

**Docs:** [Agent Loop](https://strandsagents.com/docs/user-guide/concepts/agents/agent-loop/)

---

### Orchestrator Agent
**What it is:** An agent that coordinates multiple sub-agents as callable tools.

**What it does:** Wraps other agents as tools using the "Agents as Tools" pattern. The orchestrator decides which sub-agent to invoke based on the current task. Best for workflows where specialized agents handle different domains.

**Example:** A research orchestrator that delegates to a "web search agent" and a "document analysis agent."

**Strands SDK:** Sub-agents wrapped with `@tool` decorator and passed to orchestrator's `tools=[...]`

**Docs:** [Agents as Tools](https://strandsagents.com/docs/user-guide/concepts/multi-agent/agents-as-tools/)

---

### Swarm
**What it is:** A team of autonomous agents that hand off tasks to each other.

**What it does:** Agents collaboratively solve problems by passing control to the most suitable peer. The agents themselves decide the execution path — not the developer. Supports handoff limits, execution timeouts, and repetitive-handoff detection.

**Example:** Customer support where a general agent hands off to billing, technical, or retention specialists.

**Strands SDK:** `Swarm([agent_a, agent_b, agent_c], entry_point=agent_a)`

**Docs:** [Swarm](https://strandsagents.com/docs/user-guide/concepts/multi-agent/swarm/)

---

### A2A Agent
**What it is:** A client that connects to a remote agent via the Agent-to-Agent (A2A) protocol.

**What it does:** Enables cross-platform agent communication. Invoke agents running on different servers, frameworks, or organizations as if they were local. Uses the open A2A standard with JSON-RPC transport.

**Example:** Your local orchestrator calling a remote ML analysis agent hosted on a different team's server.

**Strands SDK:** `A2AAgent(endpoint="http://remote-server:9000")`

**Docs:** [Agent-to-Agent](https://strandsagents.com/docs/user-guide/concepts/multi-agent/agent-to-agent/)

---

### Workflow
**What it is:** A deterministic task pipeline (DAG) with explicit dependencies.

**What it does:** Define tasks with descriptions, system prompts, and dependencies. The workflow engine resolves the dependency graph, runs independent tasks in parallel, and passes results downstream. Best for repeatable, multi-step processes.

**Example:** Data extraction → trend analysis → report generation, where analysis depends on extraction.

**Strands SDK:** `agent.tool.workflow(action="create", workflow_id="...", tasks=[...])`

**Docs:** [Workflow](https://strandsagents.com/docs/user-guide/concepts/multi-agent/workflow/)

---

### Function Node (Graph Mode)
**What it is:** A deterministic Python function that runs without calling an LLM.

**What it does:** Executes pure Python code as a graph node — for data transformation, validation, API calls, or business logic. Faster and cheaper than agent nodes for non-AI operations.

**Example:** A validation function that checks data format before passing to an analysis agent.

**Strands SDK:** Custom `MultiAgentBase` subclass added via `builder.add_node(function_node, "validator")`

**Docs:** [Custom Node Types](https://strandsagents.com/docs/user-guide/concepts/multi-agent/graph/#custom-node-types)

---

### Built-in Tool
**What it is:** Pre-built tool functions from the `strands-tools` package.

**What it does:** Gives agents capabilities without writing code. Connect to an agent's "Tools" handle. Available tools include: calculator, file_read, file_write, shell, http_request, current_time, editor, retrieve (RAG), mem0_memory, workflow, and more.

**Strands SDK:** `from strands_tools import calculator, file_read, shell`

**Docs:** [Community Tools Package](https://strandsagents.com/docs/user-guide/concepts/tools/community-tools-package/)

---

### MCP Server
**What it is:** A Model Context Protocol server that provides tools, resources, and prompts.

**What it does:** Connects your agent to external capabilities via the standardized MCP protocol. Supports stdio (local process), SSE, and streamable HTTP transports. Each MCP server can connect to one agent.

**Example:** A GitHub MCP server that gives your agent ability to create issues, read repos, and manage PRs.

**Strands SDK:** `MCPClient(lambda: stdio_client(StdioServerParameters(command="uvx", args=["server"])))`

**Docs:** [MCP Tools](https://strandsagents.com/docs/user-guide/concepts/tools/mcp-tools/)

---

### Custom Tool
**What it is:** A Python function you write with the `@tool` decorator.

**What it does:** Define any custom capability for your agent. Write the function, add type hints and a docstring (the LLM reads this to decide when to call it), and connect to an agent.

**Example:** A tool that queries your company's internal API, processes results, and returns structured data.

**Strands SDK:** `@tool def my_tool(param: str) -> dict: ...`

**Docs:** [Custom Tools](https://strandsagents.com/docs/user-guide/concepts/tools/custom-tools/)

---

### Input Node
**What it is:** The entry point for user prompts in your flow.

**What it does:** Represents the user's message that gets passed to the connected agent or workflow. Every flow needs at least one Input node.

**Strands SDK:** The `user_input` string passed to `agent(user_input)` or `graph(user_input)`

---

### Output Node
**What it is:** The exit point that captures the agent's final response.

**What it does:** Receives the agent's output for display or downstream processing. Required for code generation — without it, generated code won't return results.

**Strands SDK:** The `AgentResult` or `MultiAgentResult` returned from invocation.

---

## Configuration Concepts

### Model Provider
**What it is:** The AI service that hosts the LLM your agent uses.

**Options:** AWS Bedrock, OpenAI, Anthropic, Google, Ollama, LiteLLM, MistralAI, SageMaker, LlamaAPI, llama.cpp, Writer, Vercel, Custom

**Docs:** [Model Providers](https://strandsagents.com/docs/user-guide/concepts/model-providers/)

---

### System Prompt
**What it is:** Instructions that define the agent's role, behavior, and constraints.

**Best practices:**
- Define the agent's role clearly ("You are a financial analyst...")
- Specify output format expectations
- List constraints and boundaries
- Keep it focused — use tools for knowledge, not the prompt

**Docs:** [Prompts](https://strandsagents.com/docs/user-guide/concepts/agents/prompts/)

---

### Temperature
**What it is:** Controls randomness in LLM responses. Range: 0.0 to 1.0.

| Value | Behavior | Use case |
|-------|----------|----------|
| 0.0 | Deterministic, same answer every time | Structured data extraction, code generation |
| 0.3 | Low randomness, consistent | Q&A, classification, factual tasks |
| 0.7 | Balanced (default) | General assistant, creative + accurate |
| 1.0 | Maximum randomness | Brainstorming, creative writing, exploration |

---

### Retry Strategy
**What it is:** Automatic retry behavior when model calls fail (throttling, timeouts, transient errors).

**Config:** Max attempts, initial delay, max delay (exponential backoff).

**Strands SDK:** `ModelRetryStrategy(max_attempts=6, initial_delay=4, max_delay=128)`

**Docs:** [Retry Strategies](https://strandsagents.com/docs/user-guide/concepts/agents/retry-strategies/)

---

### Conversation Manager
**What it is:** Controls how conversation history is managed across turns.

**Options:**
- **Default** — SDK managed (keeps all messages)
- **Sliding Window** — Keeps last N messages (saves tokens)
- **Summarizing** — Compresses old messages into a summary
- **Null** — No history (each turn is independent)

**Docs:** [Conversation Management](https://strandsagents.com/docs/user-guide/concepts/agents/conversation-management/)

---

### Session Manager
**What it is:** Persists agent state across separate invocations (conversations resume later).

**Options:** File (local disk), S3 (cloud storage), None

**Docs:** [Session Management](https://strandsagents.com/docs/user-guide/concepts/agents/session-management/)

---

### Structured Output
**What it is:** Forces the agent to respond in a specific schema (Pydantic model).

**What it does:** Guarantees the response matches your data model — useful for APIs, data pipelines, and typed integrations.

**Strands SDK:** `Agent(output_model=MyPydanticModel)`

**Docs:** [Structured Output](https://strandsagents.com/docs/user-guide/concepts/agents/structured-output/)

---

### Invocation Limits
**What it is:** Boundaries that prevent runaway execution.

- **Max Turns** — Maximum agent loop iterations before stopping
- **Total Token Budget** — Maximum tokens consumed across all turns

**Why needed:** Without limits, an agent stuck in a tool loop could run indefinitely, consuming resources.

---

## Safety & Security

### Guardrails (Bedrock)
**What it is:** AWS Bedrock's built-in content filtering applied to model inputs/outputs.

**What it does:** Blocks harmful content, enforces topic policies, redacts PII, filters profanity. Applied at the model level — transparent to the agent.

**Config:** Guardrail ID, version, trace mode, input/output redaction.

**Docs:** [Guardrails](https://strandsagents.com/docs/user-guide/safety-security/guardrails/)

---

### Agent Control
**What it is:** Open-source runtime guardrails by Galileo (plugin-based).

**What it does:** Evaluates every agent input/output against configurable rules. Can deny (block) or steer (redirect) agent behavior without code changes.

**Strands SDK:** `AgentControlPlugin(agent_name="my-agent")`

**Docs:** [Agent Control](https://strandsagents.com/blog/strands-agents-with-agent-control/)

---

### Human-in-the-Loop
**What it is:** Approval gates that pause agent execution before high-risk tool calls.

**What it does:** Requires human confirmation before executing dangerous operations (shell commands, file writes, HTTP requests). Configurable per-tool or global.

**Docs:** [Human in the Loop](https://strandsagents.com/docs/user-guide/concepts/agents/interventions/human-in-the-loop/)

---

## Observability

### OpenTelemetry Tracing
**What it is:** Distributed tracing for agent execution (spans, metrics, logs).

**What it does:** Captures timing, tool calls, model invocations, and errors as OTEL traces. Export to any OTEL-compatible backend (Jaeger, Grafana Tempo, AWS X-Ray).

**Config:** Enable via `STRANDS_OTEL_ENABLE_TRACING=true` environment variable.

**Docs:** [Observability](https://strandsagents.com/docs/user-guide/observability-evaluation/observability/)

---

### Agent SOPs
**What it is:** Standard Operating Procedures written in markdown that guide agent behavior.

**What it does:** Natural language workflow definitions appended to the system prompt. Define step-by-step procedures, constraints, and success criteria without code.

**Docs:** [Agent SOPs](https://strandsagents.com/blog/introducing-strands-agent-sops/)

---

## Multi-Agent Patterns

### Graph Mode
**What it is:** A DAG-based execution model where agents are nodes and edges define dependencies.

**What it does:** Deterministic execution order. Output from one node becomes input for dependent nodes. Supports sequential, parallel, branching, and feedback loop topologies.

**Key config:** Execution timeout, max node executions, allow cycles, reset on revisit, streaming.

**Strands SDK:** `GraphBuilder().add_node(...).add_edge(...).build()`

**Docs:** [Graph](https://strandsagents.com/docs/user-guide/concepts/multi-agent/graph/)

---

### Graph Topologies

| Topology | Description | Example |
|----------|-------------|---------|
| **Sequential** | A → B → C → D | Research → Analysis → Review → Report |
| **Parallel** | A → B, A → C, B+C → D | Coordinator → Workers → Aggregator |
| **Branching** | A → B (if condition), A → C (else) | Classifier → Technical/Business branch |
| **Feedback Loop** | A → B → A (with exit condition) | Writer → Reviewer → Writer (until approved) |

---

## Plugins

### Goal Loop
**What it is:** Autonomous iteration toward a goal.

**What it does:** Repeats agent execution until a goal is achieved or max iterations reached. The agent self-evaluates progress after each iteration.

**Docs:** [Goal Loop](https://strandsagents.com/docs/user-guide/concepts/plugins/goal-loop/)

---

### Skills Plugin
**What it is:** On-demand domain knowledge loaded as markdown.

**What it does:** Provides workflow guidance without bloating the system prompt. The agent activates skills when needed.

**Docs:** [Skills](https://strandsagents.com/docs/user-guide/concepts/plugins/skills/)

---

### Steering
**What it is:** Evaluates agent responses and guides retries with corrective feedback.

**What it does:** Keeps the agent within boundaries by providing correction instructions when it drifts off-track — without hard-blocking.

**Docs:** [Steering](https://strandsagents.com/docs/user-guide/concepts/plugins/steering/)

---

## Deployment

### Supported Targets

| Target | Type | Best for |
|--------|------|----------|
| **Bedrock AgentCore** | Managed | Production agents with auto-scaling |
| **AWS Lambda** | Serverless | Event-driven, low-traffic agents |
| **ECS Fargate** | Container | Long-running, high-throughput agents |
| **App Runner** | Managed container | Simple web APIs |
| **EKS** | Kubernetes | Complex multi-service deployments |
| **EC2** | VM | Full control, GPU workloads |
| **Docker** | Container | Local/cloud flexible |

**Docs:** [Deploy](https://strandsagents.com/docs/user-guide/deploy/operating-agents-in-production/)

---

## Glossary

| Term | Definition |
|------|-----------|
| **Agent Loop** | The core cycle: receive input → reason → call tools → generate response |
| **Tool** | A callable function the agent can invoke during reasoning |
| **Handle** | Connection point on a node (Input, Output, Tools) |
| **Edge** | A connection between two nodes defining data flow |
| **Entry Point** | First node(s) that receive user input in a graph |
| **Node** | Any element on the canvas (agent, tool, input, output) |
| **Flow** | A complete visual pipeline from Input → Processing → Output |
| **Invocation** | A single call to an agent with a prompt |
| **Turn** | One iteration of the agent loop (prompt → tool calls → response) |
| **Token** | Unit of text processed by the LLM (roughly 4 characters = 1 token) |
| **Callback Handler** | Processes streaming output from the agent in real-time |
| **invocation_state** | Key-value context passed to all agents/tools during execution |
| **Content Block** | A unit of content (text, image, tool result) in agent messages |
