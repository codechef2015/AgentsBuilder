# Release Tracking — Framework SDK Compatibility

This document tracks which SDK version each framework adapter is built against, what features are supported, and what's pending for the next SDK update.

---

## Strands Agents SDK

| Field | Value |
|-------|-------|
| **Current Builder Version** | v1.47.0 |
| **SDK Repository** | https://github.com/strands-agents/sdk-python |
| **Changelog** | https://github.com/strands-agents/sdk-python/releases |
| **Docs** | https://strandsagents.com/ |
| **Last Checked** | 2026-07-13 |

### Supported Features (v1.47.0)

| Feature | SDK Version Introduced | Status |
|---------|----------------------|--------|
| Agent + tool decorator | v1.0.0 | ✅ Supported |
| Multi-agent: Agents-as-Tools | v1.0.0 | ✅ Supported |
| Multi-agent: Graph (DAG + cycles) | v1.5.0 | ✅ Supported |
| Multi-agent: Swarm | v1.5.0 | ✅ Supported |
| Multi-agent: Workflow | v1.10.0 | ✅ Supported |
| Multi-agent: A2A Protocol | v1.15.0 | ✅ Supported |
| Model providers: Bedrock, OpenAI, Anthropic, Gemini, Ollama, LiteLLM, Mistral, SageMaker, LlamaAPI, llama.cpp, Writer | v1.0.0+ | ✅ Supported |
| Retry Strategy (exponential backoff) | v1.0.0 | ✅ Supported |
| Conversation Manager (Sliding, Summarizing, Null) | v1.5.0 | ✅ Supported |
| Session Manager (File, S3) | v1.10.0 | ✅ Supported |
| Invocation Limits (turns, tokens) | v1.10.0 | ✅ Supported |
| Structured Output (Pydantic) | v1.15.0 | ✅ Supported |
| HookProvider lifecycle callbacks | v1.0.0 | ✅ Supported |
| Guardrails: Bedrock Guardrails | v1.10.0 | ✅ Supported |
| Guardrails: Agent Control (Galileo) | v1.20.0 | ✅ Supported |
| Guardrails: Custom Hook Guardrails | v1.25.0 | ✅ Supported |
| OpenTelemetry (OTLP/gRPC, HTTP, Console) | v1.15.0 | ✅ Supported |
| Agent SOPs (Markdown workflows) | v1.20.0 | ✅ Supported |
| Memory: Bedrock Knowledge Base | v1.30.0 | ✅ Supported |
| Memory: Mem0 | v1.25.0 | ✅ Supported |
| Goal Loop Plugin | v1.35.0 | ✅ Supported |
| Human-in-the-Loop (Interventions) | v1.40.0 | ✅ Supported |
| Community Tools Catalog | v1.0.0+ | ✅ Supported |
| MCP Tools (stdio, SSE, streamable HTTP) | v1.5.0 | ✅ Supported |
| Deployment: AgentCore | v1.20.0 | ✅ Supported |
| Deployment: Lambda | v1.10.0 | ✅ Supported |
| Deployment: ECS Fargate | v1.15.0 | ✅ Supported |
| Skills Plugin | v1.25.0 | ✅ Supported |
| Steering Handler | v1.30.0 | ✅ Supported |
| Context Manager ("auto") | v1.43.0 | ⬜ Not yet |
| Memory Manager (extraction + injection) | v1.44.0 | ⬜ Not yet |
| Middleware System | v1.44.0 | ⬜ Not yet |
| Sandbox (Docker/SSH) | v1.44.0 | ⬜ Not yet |
| Message Pinning | v1.43.0 | ⬜ Not yet |
| Durable Checkpoints | v1.47.0 | ⬜ Not yet |
| Span Redaction (OTEL) | v1.47.0 | ⬜ Not yet |
| MCP continue_on_error | v1.47.0 | ⬜ Not yet |

### Next SDK Features to Add

| Priority | Feature | SDK Version | Effort |
|----------|---------|-------------|--------|
| High | Memory Manager (auto-extract + inject) | v1.44.0 | Medium |
| High | Context Manager "auto" | v1.43.0 | Low |
| Medium | Sandbox integration | v1.44.0 | High |
| Medium | Middleware pipeline | v1.44.0 | Medium |
| Low | Durable checkpoints | v1.47.0 | High |
| Low | Message pinning | v1.43.0 | Low |

---

## Google ADK (Agent Development Kit)

| Field | Value |
|-------|-------|
| **Current Builder Version** | v1.28.0 |
| **SDK Repository** | https://github.com/google/adk-python |
| **Changelog** | https://github.com/google/adk-python/blob/main/CHANGELOG.md |
| **Docs** | https://google.github.io/adk-docs/ |
| **Last Checked** | 2026-07-13 |

### Supported Features (v1.28.0)

| Feature | SDK Version Introduced | Status |
|---------|----------------------|--------|
| LlmAgent (Agent alias) | v0.1.0 | ✅ Supported |
| SequentialAgent | v0.1.0 | ✅ Supported |
| ParallelAgent | v0.1.0 | ✅ Supported |
| LoopAgent | v0.1.0 | ✅ Supported |
| Custom BaseAgent | v0.1.0 | ⬜ Not yet |
| FunctionTool | v0.1.0 | ✅ Supported |
| MCPToolset (stdio + SSE) | v0.5.0 | ✅ Supported |
| Built-in: google_search | v0.1.0 | ✅ Supported |
| Built-in: code_execution | v0.1.0 | ✅ Supported |
| Built-in: vertex_ai_search | v0.5.0 | ⬜ Not yet |
| Callbacks: before/after_agent | v0.3.0 | ✅ Supported |
| Callbacks: before/after_model | v0.3.0 | ✅ Supported |
| Callbacks: before/after_tool | v0.3.0 | ✅ Supported |
| Model: Gemini (direct string) | v0.1.0 | ✅ Supported |
| Model: Vertex AI | v0.1.0 | ✅ Supported |
| Model: LiteLLM (100+ providers) | v0.5.0 | ✅ Supported |
| Model: Ollama (via LiteLLM) | v0.5.0 | ✅ Supported |
| GenerateContentConfig | v0.3.0 | ✅ Supported |
| Session: InMemorySessionService | v0.1.0 | ✅ Supported |
| Session: DatabaseSessionService | v0.5.0 | ✅ Supported |
| Session: VertexAiSessionService | v0.10.0 | ✅ Supported |
| State management (session.state) | v0.1.0 | ✅ Supported |
| State prefixes (user:, app:, temp:) | v0.5.0 | ✅ Supported |
| output_key (save response to state) | v0.3.0 | ✅ Supported |
| Instruction templating ({state_key}) | v0.3.0 | ✅ Supported |
| Runner (async execution) | v0.1.0 | ✅ Supported |
| A2A Protocol (to_a2a) | v1.0.0 | ⬜ Not yet |
| Deploy: Vertex AI Agent Engine | v1.0.0 | ✅ Supported |
| Deploy: Cloud Run | v1.0.0 | ✅ Supported |
| Structured Output (output_schema) | v0.10.0 | ⬜ Not yet |
| Planner (ThinkingConfig) | v1.10.0 | ⬜ Not yet |
| Code Executor (BuiltInCodeExecutor) | v1.10.0 | ⬜ Not yet |
| Transfer controls (disallow_transfer_to_parent/peers) | v1.0.0 | ⬜ Not yet |
| Evaluation framework (strands-agents-evals) | v1.15.0 | ⬜ Not yet |
| MCP sampling callback | v1.28.0 | ⬜ Not yet |
| A2A lifespan parameter | v1.28.0 | ⬜ Not yet |
| Spanner Toolset | v1.28.0 | ⬜ Not yet |
| Slack integration | v1.28.0 | ⬜ Not yet |
| BigQuery Toolset | v1.20.0 | ⬜ Not yet |

### Next SDK Features to Add

| Priority | Feature | SDK Version | Effort |
|----------|---------|-------------|--------|
| High | A2A Protocol (to_a2a node) | v1.0.0 | Medium |
| High | Custom BaseAgent node | v0.1.0 | Medium |
| High | Structured Output (output_schema) | v0.10.0 | Low |
| Medium | Planner + ThinkingConfig | v1.10.0 | Medium |
| Medium | Transfer controls | v1.0.0 | Low |
| Medium | vertex_ai_search built-in tool | v0.5.0 | Low |
| Low | Code Executor | v1.10.0 | Medium |
| Low | Spanner/BigQuery toolsets | v1.20.0+ | High |
| Low | Evaluation framework | v1.15.0 | High |

---

## Version Update Process

When a new SDK version is released:

1. **Check changelog** — Review new features in the release notes
2. **Update this file** — Add new features to the tracking table
3. **Prioritize** — Determine which features to add to the builder
4. **Implement** — Add nodes/codegen/config for new features
5. **Update adapter version** — Bump `version` in the adapter's `adapter.ts`
6. **Update README badges** — Reflect new supported version
7. **Test codegen** — Verify generated code uses correct imports for new version

### Files to Update on Version Bump

| Framework | Files |
|-----------|-------|
| Strands | `src/frameworks/strands/adapter.ts` (version field), `README.md` badge |
| Google ADK | `src/frameworks/google-adk/adapter.ts` (version field), `README.md` badge |
| Both | `RELEASE_TRACKING.md` (this file) |

---

## Compatibility Matrix

| Feature Category | Strands | Google ADK | Notes |
|-----------------|---------|------------|-------|
| Single Agent | ✅ Agent | ✅ LlmAgent | Different constructor APIs |
| Sequential Multi-Agent | ✅ Workflow | ✅ SequentialAgent | Similar concept, different naming |
| Parallel Execution | ✅ Graph (parallel) | ✅ ParallelAgent | Strands uses Graph nodes, ADK has dedicated type |
| Iterative Loops | ✅ Graph (cycles) | ✅ LoopAgent | Strands uses conditional edges, ADK escalation |
| Autonomous Handoff | ✅ Swarm | ❌ (via sub-agents) | ADK uses agent hierarchy instead |
| Remote Agents | ✅ A2A | ✅ A2A (to_a2a) | Same protocol, different wrappers |
| Function Tools | ✅ @tool decorator | ✅ FunctionTool | Different syntax, same concept |
| MCP Integration | ✅ MCPClient | ✅ MCPToolset | Both support stdio + SSE |
| Model Providers | 15+ | Gemini + LiteLLM | Strands native, ADK via LiteLLM |
| Guardrails | Bedrock + Hooks | Callbacks | Different mechanisms, same goal |
| Observability | OpenTelemetry | (manual/callbacks) | Strands has built-in OTEL |
| Memory | Bedrock KB + Mem0 | Session state | Different persistence models |
| Deployment | AWS (3 targets) | GCP (2 targets) | Cloud-specific |
