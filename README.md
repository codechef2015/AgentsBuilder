# AgenticBuilder

**Visual AI Agent Builder** | Multi-Framework | No-Code Agent Workflows | Drag-and-Drop | Python Code Generation | Multi-Agent Orchestration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Strands SDK](https://img.shields.io/badge/Strands_SDK-v1.47.0-blue.svg)](https://strandsagents.com/)
[![Google ADK](https://img.shields.io/badge/Google_ADK-v1.36.x-emerald.svg)](https://google.github.io/adk-docs/)

> Build AI agent teams visually — drag, connect, configure, deploy. Supports **Strands Agents SDK** and **Google ADK**. No coding required to get started. Full Python code generated automatically.

### 🎬 Demo

https://github.com/codechef2015/AgentsBuilder/raw/main/ScreenShots/Demo_v1.mp4

> *Click to play — see AgenticBuilder in action: framework selection, drag-and-drop nodes, code generation, and template loading.*

---

A visual drag-and-drop interface for creating, configuring, and executing AI agent workflows. Build complex agent interactions through an intuitive node-based editor that generates Python code using the [Strands Agents SDK](https://strandsagents.com/) or [Google Agent Development Kit (ADK)](https://google.github.io/adk-docs/).

### 🔍 Keywords

`ai-agents` `agent-builder` `visual-programming` `no-code` `low-code` `strands-agents` `google-adk` `multi-agent` `agent-orchestration` `llm` `bedrock` `openai` `anthropic` `gemini` `drag-and-drop` `flow-editor` `react-flow` `xyflow` `python-code-generation` `aws-bedrock` `vertex-ai` `agent-workflow` `ai-workflow-builder` `mcp-server` `model-context-protocol` `swarm-agents` `graph-agents` `a2a-protocol` `agent-to-agent` `guardrails` `opentelemetry` `agent-deployment` `lambda-deployment` `ecs-fargate` `agentcore` `structured-output` `conversation-management` `session-management` `agent-sops` `human-in-the-loop` `google-cloud` `aws` `amazon-bedrock` `gemini-api` `vertex-ai-agent-engine` `cloud-run` `google-gemini` `claude` `gpt-4` `ollama` `litellm` `mistral` `agent-framework` `multi-agent-system` `agent-workflow-builder` `sequential-agent` `parallel-agent` `loop-agent` `function-tool` `agentic-ai` `ai-orchestration` `agent-to-agent-protocol` `strands-sdk` `google-agent-development-kit`

---

## ⭐ Highlights — Ready-to-Use Templates

Start building immediately with **16 pre-built templates** from real-world patterns:

### Strands Agents SDK Templates (8)

| Template | Pattern | Source | Features Used |
|----------|---------|--------|---------------|
| 🎮 **Pokemon Battle Orchestrator** | Agents-as-Tools | [Itsuki's Article](https://levelup.gitconnected.com/strands-agents-interesting-multi-agent-pattern-0c7f97088b6d) | Routing prompt, multi-specialist delegation |
| 🐝 **Pokemon Swarm Team** | Swarm (Autonomous) | [Itsuki's Article](https://levelup.gitconnected.com/strands-agents-interesting-multi-agent-pattern-0c7f97088b6d) | 4 agents, handoff detection, shared context |
| 📊 **Pokemon Research Graph** | Graph (Parallel) | [Itsuki's Article](https://levelup.gitconnected.com/strands-agents-interesting-multi-agent-pattern-0c7f97088b6d) | Fan-out to specialists → aggregation |
| 🏭 **Production-Ready Agent** | Single Agent (Full) | [Strands SDK](https://strandsagents.com/) | Guardrails, OTEL, Memory, SOPs, Retry, Session, HITL |
| 🔄 **Writer-Reviewer Loop** | Graph (Cyclic) | [Strands Graph Docs](https://strandsagents.com/docs/user-guide/concepts/multi-agent/graph/) | Feedback loop, conditional routing |
| 🌐 **Distributed ML Pipeline** | A2A + Graph | [Strands A2A Docs](https://strandsagents.com/docs/user-guide/concepts/multi-agent/agent-to-agent/) | Remote agents, parallel processing |
| 🔍 **MCP Research Agent** | Single + MCP | [Strands MCP Docs](https://strandsagents.com/docs/user-guide/concepts/tools/mcp-tools/) | Multiple MCP servers, streaming |
| 📋 **Data Analysis Workflow** | Workflow DAG | [Strands Workflow Docs](https://strandsagents.com/docs/user-guide/concepts/multi-agent/workflow/) | Task dependencies, parallel execution |

### Google ADK Templates (8)

| Template | Pattern | Source | Features Used |
|----------|---------|--------|---------------|
| 🏭 **Production-Ready ADK Agent** | Single (Full) | [ADK Docs](https://google.github.io/adk-docs/agents/llm-agents/) | Callbacks, guardrails, FunctionTool, state, GenerateContentConfig |
| 📝 **Research-Write-Review Pipeline** | Sequential | [ADK Docs](https://google.github.io/adk-docs/agents/workflow-agents/sequential-agent/) | 3-stage pipeline, output_key state passing |
| ⇉ **Multi-Source Intelligence** | Parallel | [ADK Docs](https://google.github.io/adk-docs/agents/workflow-agents/parallel-agent/) | 4 concurrent agents, synthesis, output aggregation |
| 🔄 **Writer-Reviewer Loop** | Loop | [ADK Docs](https://google.github.io/adk-docs/agents/workflow-agents/loop-agent/) | Iterative refinement, escalation, max iterations |
| 🔍 **MCP Research Agent** | Single + MCP | [ADK Docs](https://google.github.io/adk-docs/tools-custom/mcp-tools/) | MCPToolset (stdio + SSE), FunctionTool, Google Search |
| 🎯 **Customer Support Router** | Agent Routing | [ADK Docs](https://google.github.io/adk-docs/agents/llm-agents/) | sub_agents delegation, specialist routing |
| 🏗️ **Nested Workflow** | Sequential + Parallel | [ADK Docs](https://google.github.io/adk-docs/agents/workflow-agents/) | Composable patterns, inner parallel stage |
| 🛡️ **Callbacks & Guardrails** | Safety Pattern | [ADK Docs](https://google.github.io/adk-docs/callbacks/) | All 6 callbacks, PII detection, content filtering |

Templates load from MySQL database via API, filtered by active framework. Click **Open → Templates** to use them.

---

## Features

### Framework Selector
- Landing page to choose between **Strands Agents SDK** or **Google ADK**
- Framework-specific canvas, nodes, code generation, and deployment
- Switch frameworks anytime via header badge
- Projects and auto-save isolated per framework (no conflicts)

### Visual Flow Editor
- Drag-and-drop canvas with snap-to-grid
- Auto-layout (5 arrangements: Horizontal, Vertical, Radial, Grid, Shuffle)
- Connection-aware layouts using topological sorting
- Semantic edge labels (tool, depends, sub-agent, ✓ true, ✗ false)
- Colored MiniMap with node-type identification
- Quick-add toolbar for one-click node creation
- Auto fit-to-view when loading templates
- Keyboard shortcuts (Ctrl+S save, Ctrl+Z undo, Delete, shortcuts panel)

### Strands Agents SDK — Nodes & Patterns

| Node Type | Purpose |
|-----------|---------|
| Agent | Single LLM agent with tools |
| Orchestrator | Agents-as-Tools hierarchical delegation |
| Swarm | Autonomous handoff with shared context |
| Graph Builder | Deterministic DAG with conditional edges, cycles, parallel execution |
| Workflow | Task DAG with dependencies and parallel execution |
| A2A Agent | Remote Agent-to-Agent protocol |
| Function Node | Deterministic Python (no LLM) for graph pipelines |
| Condition Node | If/else branching in graphs |
| Built-in Tool | calculator, file_read, shell, http_request, etc. |
| MCP Server | Model Context Protocol integration (stdio, SSE) |
| Custom Tool | User-defined @tool decorator functions |
| Input / Output | Flow entry and exit points |

**Configuration:** 15+ model providers, Retry Strategy, Conversation Manager, Session Manager, Invocation Limits, Structured Output, Goal Loop, Human-in-the-Loop, Community Tools, Agent SOPs

**Safety:** Bedrock Guardrails, Agent Control (Galileo), Custom Hook Guardrails

**Observability:** OpenTelemetry (OTLP/gRPC, OTLP/HTTP, Console), tracing, metrics

**Memory:** Bedrock Knowledge Base (RAG), Mem0 (conversational memory)

**Deployment:** AWS Bedrock AgentCore, AWS Lambda, ECS Fargate

### Google ADK — Nodes & Patterns

| Node Type | Purpose |
|-----------|---------|
| LLM Agent | Reasoning agent powered by Gemini/LiteLLM |
| Sequential Agent | Runs sub-agents one after another |
| Parallel Agent | Runs sub-agents concurrently |
| Loop Agent | Repeats sub-agents until escalation |
| Custom Agent | User-defined BaseAgent with `_run_async_impl` |
| Function Tool | Python function wrapped as FunctionTool |
| MCP Toolset | MCPToolset (stdio + SSE transports) |
| Built-in Tool | google_search, vertex_ai_search, google_maps_grounding |
| A2A Tool | Remote Agent-to-Agent protocol connection |
| Input / Output | Flow entry and exit points |

**Configuration:** Gemini (default), Vertex AI, LiteLLM (100+ providers), Ollama · GenerateContentConfig (temperature, top_p, top_k, max_output_tokens) · output_key for state passing · Instruction templating with `{state_key}`

**Callbacks (Guardrails):** before_agent, after_agent, before_model (content filter), after_model (output sanitize), before_tool (policy enforcement), after_tool (audit logging)

**Session Management:** InMemorySessionService, DatabaseSessionService (SQLite/PostgreSQL/MySQL), VertexAiSessionService · State prefixes (user:, app:, temp:)

**Deployment:** Vertex AI Agent Engine, Cloud Run

### Code Generation
- Full Python code from visual flows (both Strands and ADK)
- Framework-aware imports (verified against latest SDK docs)
- Bidirectional code editing (generate ↔ edit)
- Syntax validation for custom tools
- Flow validation with navigate-to-node
- Copy to clipboard, download as `.py`

### Interactive Execution
- Single-turn execution with streaming
- Multi-turn chat with conversation history
- Framework-routed backend execution (Strands or ADK)
- Live WebSocket updates
- Execution history with artifacts

### UX & Accessibility
- Welcome onboarding overlay
- Toast notification system (no native alerts)
- Themed confirmation modals
- Validation indicators on nodes (red/amber badges with hover tooltips)
- Property panel with contextual help tooltips
- Node palette with documentation links
- Undo/Redo (Ctrl+Z / Ctrl+Shift+Z)
- Responsive layout with fixed header/sidebar

---

## Quick Start

### Environment Setup

1. Install [Node.js 22](https://nodejs.org/en/download)
2. Install [uv](https://docs.astral.sh/uv/getting-started/installation/)
3. Install frontend dependencies:
```bash
npm install
```
4. Install backend dependencies:
```bash
cd backend
uv sync
```

### Development
```bash
# Start frontend
npm run dev

# Start backend (new terminal)
cd backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Access at http://localhost:5173
```

### Database Setup (MySQL — for templates)
```sql
CREATE DATABASE strands_builder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Then run migrations in order:
```bash
mysql -u root strands_builder < backend/db/migrations/001_create_templates_table.sql
mysql -u root strands_builder < backend/db/migrations/002_seed_official_templates.sql
mysql -u root strands_builder < backend/db/migrations/005_seed_rich_templates.sql
mysql -u root strands_builder < backend/db/migrations/006_add_framework_column.sql
mysql -u root strands_builder < backend/db/migrations/007_seed_rich_adk_templates.sql
```

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, XYFlow (React Flow)
- **Backend**: FastAPI, Python, Uvicorn
- **Database**: MySQL 8 (templates, projects, evaluations)
- **AI Frameworks**: Strands Agents SDK (Python) + Google ADK (Python)
- **Deployment**: AWS (AgentCore, Lambda, ECS Fargate) + GCP (Vertex AI, Cloud Run)

### SDK Compatibility

This builder is updated to support features up to **Strands Agents SDK v1.47.0** (Python). Code generation covers the full SDK surface including multi-agent patterns (Graph, Swarm, A2A), memory management, interventions, and observability features introduced through v1.47.0.

Google ADK support targets **v1.36.x** (latest maintained 1.x branch). Code generation produces valid Python with correct imports for LlmAgent, workflow agents, FunctionTool, MCPToolset, callbacks, and session management.

---

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌──────────────┐
│  React Frontend │  API    │  FastAPI Backend │  SQL    │   MySQL DB   │
│  (Visual Editor)│ ──────→ │  (Code Exec +   │ ──────→ │  (Templates, │
│  Port 5173      │         │   Deploy + Chat) │         │   Projects)  │
│                 │ ←────── │  Port 8000       │ ←────── │              │
└─────────────────┘         └─────────────────┘         └──────────────┘
```

---

---

## ⚠️ Legal Disclaimers & Compliance

### Not an Official Product

**This project is NOT an official Amazon Web Services (AWS) product.** It is an independent, community-driven open-source project. It is not endorsed, sponsored, affiliated with, or supported by Amazon Web Services, Inc. or any of its affiliates.

### Trademarks

- "Amazon Web Services", "AWS", "Amazon Bedrock", "AWS Lambda", "Amazon ECS", "AWS Fargate", "Amazon SageMaker", and all related logos are trademarks or registered trademarks of Amazon.com, Inc. or its affiliates.
- "OpenAI" is a trademark of OpenAI, Inc.
- "Anthropic" and "Claude" are trademarks of Anthropic, PBC.
- "Google" and "Gemini" are trademarks of Google LLC.
- All other trademarks are the property of their respective owners.

Use of these names in this project is for identification purposes only and does not imply endorsement.

### No Warranty

THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY.

### Data & Security Notice

- This tool generates Python code that may interact with cloud services (AWS, OpenAI, etc.). Users are responsible for:
  - Securing their own API keys and credentials
  - Reviewing generated code before deployment to production
  - Complying with their organization's security policies
  - Ensuring proper IAM permissions and access controls
  - Protecting any PII or sensitive data processed by agents
- Generated agent code runs with the permissions of the executing user's AWS credentials
- No telemetry, analytics, or usage data is collected by this project

### AI-Generated Code Warning

Code generated by this tool is produced algorithmically based on visual flow configurations. **Users MUST review all generated code before production deployment.** The authors accept no liability for:
- Errors in generated code
- Unintended behaviors of deployed agents
- Costs incurred from agent execution on cloud services
- Data loss or security breaches resulting from deployed agents

### License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### Attribution & Sources

This project builds upon:
- [Strands Agents SDK](https://strandsagents.com/) — The open-source AI agent framework (Apache 2.0 License)
- [Google Agent Development Kit (ADK)](https://google.github.io/adk-docs/) — Open-source agent framework by Google (Apache 2.0 License)
- [React Flow / XYFlow](https://reactflow.dev/) — Node-based UI library (MIT License)
- [FastAPI](https://fastapi.tiangolo.com/) — Python web framework (MIT License)
- Community patterns from [Strands Agents: Interesting Multi-Agent Pattern](https://levelup.gitconnected.com/strands-agents-interesting-multi-agent-pattern-0c7f97088b6d) by Itsuki

### Contributing

By contributing to this project, you agree that your contributions will be licensed under the MIT License. Contributors retain copyright to their individual contributions.

### Responsible AI

Users of this tool are responsible for ensuring their AI agents comply with:
- Their organization's Responsible AI policies
- Applicable laws and regulations (GDPR, CCPA, etc.)
- AWS Acceptable Use Policy (if deploying to AWS)
- Model provider terms of service (OpenAI, Anthropic, Google, etc.)
