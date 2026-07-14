# Multi-Framework Agent Builder — Implementation Plan

## Vision

Transform the current **Strands-only** agent builder into a **unified multi-framework visual builder** that supports both **Strands Agents SDK** and **Google ADK (Agent Development Kit)** from a single application with shared UI components.

Users land on a **Framework Selector** page first, then enter the appropriate builder context with framework-specific nodes, code generation, and deployment options — while sharing the same visual editor infrastructure.

---

## Architecture Decision: Shared Shell + Framework Adapters

```
┌─────────────────────────────────────────────────────────────┐
│                    Framework Selector Page                    │
│           ┌──────────────┐    ┌──────────────┐              │
│           │  Strands SDK │    │  Google ADK  │              │
│           │   Builder    │    │   Builder    │              │
│           └──────┬───────┘    └──────┬───────┘              │
└──────────────────┼───────────────────┼──────────────────────┘
                   │                   │
                   ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Shared Visual Editor (React Flow)                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Flow Editor │ Canvas │ MiniMap │ Undo/Redo │ Layout │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │ Shared Components │  │ Framework-Specific Adapters  │    │
│  │ - BaseNode        │  │ - Node Types                 │    │
│  │ - PropertyPanel   │  │ - Code Generator             │    │
│  │ - CodePanel       │  │ - Node Palette               │    │
│  │ - ProjectManager  │  │ - Validator                  │    │
│  │ - ExecutionPanel  │  │ - Model Providers            │    │
│  │ - DeployPanel     │  │ - Templates                  │    │
│  │ - UI primitives   │  │ - Deployment targets         │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## What's Shared (Reused As-Is)

| Component | Location | Why Shared |
|-----------|----------|------------|
| Flow Editor canvas | `flow-editor.tsx` | Same React Flow infrastructure |
| Base Node component | `base-node.tsx` | Common node styling + handles |
| Property Panel shell | `property-panel.tsx` | Same left-panel UX pattern |
| Code Panel | `code-panel.tsx` | Displays generated code |
| Execution Panel | `execution-panel.tsx` | Runs code on backend |
| Project Manager | `project-manager.tsx` | Save/load/templates |
| Resizable Panel | `resizable-panel.tsx` | Layout primitive |
| UI primitives | `ui/` folder | button, input, select, label, tabs, toast |
| Undo/Redo | `use-undo-redo.ts` | Framework-agnostic |
| WebSocket reconnect | `websocket-reconnect.ts` | Same backend comms |
| API client | `api-client.ts` | Same backend |
| Connection banner | `connection-banner.tsx` | Same UX |

---

## What's Framework-Specific (New Adapters)

### Strands (Existing — Relocate)

| Module | Current | New Location |
|--------|---------|--------------|
| Node types | `components/nodes/*.tsx` | `src/frameworks/strands/nodes/` |
| Code generator | `lib/code-generator.ts` | `src/frameworks/strands/code-generator.ts` |
| Graph code gen | `lib/graph-code-generator.ts` | `src/frameworks/strands/graph-code-generator.ts` |
| Model providers | `lib/model-providers.ts` | `src/frameworks/strands/model-providers.ts` |
| Model code gen | `lib/model-code-generator.ts` | `src/frameworks/strands/model-code-generator.ts` |
| Agent config codegen | `lib/agent-config-codegen.ts` | `src/frameworks/strands/agent-config-codegen.ts` |
| Guardrails codegen | `lib/guardrails-codegen.ts` | `src/frameworks/strands/guardrails-codegen.ts` |
| Observability codegen | `lib/observability-codegen.ts` | `src/frameworks/strands/observability-codegen.ts` |
| Plugins codegen | `lib/plugins-codegen.ts` | `src/frameworks/strands/plugins-codegen.ts` |
| Advanced features | `lib/advanced-features-codegen.ts` | `src/frameworks/strands/advanced-features-codegen.ts` |
| Deploy auth codegen | `lib/deploy-auth-codegen.ts` | `src/frameworks/strands/deploy-auth-codegen.ts` |
| Flow validator | `lib/flow-validator.ts` | `src/frameworks/strands/flow-validator.ts` |
| Graph validator | `lib/graph-validator.ts` | `src/frameworks/strands/graph-validator.ts` |
| Connection validator | `lib/connection-validator.ts` | `src/frameworks/strands/connection-validator.ts` |
| Node palette | `node-palette.tsx` | `src/frameworks/strands/node-palette.tsx` |
| Deploy panel | `deploy-panel.tsx` + sub-panels | `src/frameworks/strands/deploy/` |
| Config components | agent-advanced-config, guardrails-config, etc. | `src/frameworks/strands/config/` |

### Google ADK (New)

| Module | Purpose | Location |
|--------|---------|----------|
| Node types | LlmAgent, SequentialAgent, ParallelAgent, LoopAgent, FunctionTool, MCPTool | `src/frameworks/google-adk/nodes/` |
| Code generator | Generate ADK Python code from flow | `src/frameworks/google-adk/code-generator.ts` |
| Model providers | Gemini, Vertex AI, LiteLLM (ADK-supported) | `src/frameworks/google-adk/model-providers.ts` |
| Node palette | ADK-specific node palette | `src/frameworks/google-adk/node-palette.tsx` |
| Flow validator | ADK-specific validation rules | `src/frameworks/google-adk/flow-validator.ts` |
| Config components | ADK agent config (callbacks, guardrails, session) | `src/frameworks/google-adk/config/` |
| Deploy panel | Vertex AI Agent Engine, Cloud Run | `src/frameworks/google-adk/deploy/` |
| Templates | Pre-built ADK templates | `src/frameworks/google-adk/templates/` |

---

## New Folder Structure

```
src/
├── App.tsx                          # Routes to FrameworkSelector or Builder
├── main.tsx                         # Entry point (unchanged)
├── index.css                        # Global styles (unchanged)
│
├── pages/
│   └── framework-selector.tsx       # Landing page — choose Strands or ADK
│
├── components/                      # SHARED components (framework-agnostic)
│   ├── flow-editor.tsx              # React Flow canvas
│   ├── base-node.tsx                # Base node component
│   ├── property-panel.tsx           # Side panel (delegates to framework config)
│   ├── code-panel.tsx               # Code display
│   ├── execution-panel.tsx          # Run agent
│   ├── main-layout.tsx              # Builder layout shell
│   ├── project-manager.tsx          # Save/load/templates
│   ├── resizable-panel.tsx          # Resizable panels
│   ├── connection-banner.tsx        # Backend status
│   ├── welcome-overlay.tsx          # Onboarding
│   ├── invoke-panel.tsx             # Cloud invocation
│   ├── chat-modal.tsx               # Multi-turn chat
│   ├── artifact-viewer.tsx          # View artifacts
│   ├── execution-detail.tsx         # Execution details
│   ├── execution-history.tsx        # History
│   ├── trace-view.tsx               # Trace waterfall
│   ├── flow-diff-view.tsx           # Diff view
│   ├── node-tooltip.tsx             # Hover tooltip
│   └── ui/                          # Primitives
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── tabs.tsx
│       ├── toast.tsx
│       ├── simple-toast.tsx
│       └── help-tooltip.tsx
│
├── lib/                             # SHARED utilities (framework-agnostic)
│   ├── api-client.ts                # Backend HTTP calls
│   ├── project-manager.ts           # Project persistence logic
│   ├── templates-client.ts          # Template API client
│   ├── use-undo-redo.ts             # Undo/redo hook
│   ├── websocket-reconnect.ts       # WS reconnection
│   ├── conversation-types.ts        # Chat types
│   ├── python-syntax-checker.ts     # Syntax validation
│   ├── utils.ts                     # General utilities
│   └── validation.ts                # Generic validation helpers
│
├── frameworks/                      # FRAMEWORK-SPECIFIC code
│   ├── types.ts                     # FrameworkAdapter interface
│   ├── registry.ts                  # Framework registry + context
│   │
│   ├── strands/                     # Strands Agents SDK adapter
│   │   ├── index.ts                 # Exports StrandsAdapter
│   │   ├── adapter.ts               # Implements FrameworkAdapter
│   │   ├── nodes/                   # All Strands node components
│   │   │   ├── index.tsx            # Node type registry
│   │   │   ├── agent-node.tsx
│   │   │   ├── orchestrator-agent-node.tsx
│   │   │   ├── tool-node.tsx
│   │   │   ├── custom-tool-node.tsx
│   │   │   ├── mcp-tool-node.tsx
│   │   │   ├── input-node.tsx
│   │   │   ├── output-node.tsx
│   │   │   ├── swarm-node.tsx
│   │   │   ├── a2a-agent-node.tsx
│   │   │   ├── workflow-node.tsx
│   │   │   ├── graph-builder-node.tsx
│   │   │   ├── function-node.tsx
│   │   │   └── condition-node.tsx
│   │   ├── code-generator.ts        # Strands code generation
│   │   ├── graph-code-generator.ts   # Graph pattern codegen
│   │   ├── model-providers.ts        # 15+ model providers
│   │   ├── model-code-generator.ts   # Model instantiation code
│   │   ├── agent-config-codegen.ts   # Retry, session, limits
│   │   ├── guardrails-codegen.ts     # Bedrock + Agent Control
│   │   ├── observability-codegen.ts  # OTEL codegen
│   │   ├── plugins-codegen.ts        # Plugins codegen
│   │   ├── advanced-features-codegen.ts
│   │   ├── deploy-auth-codegen.ts    # Deploy auth code
│   │   ├── flow-validator.ts         # Strands validation rules
│   │   ├── graph-validator.ts        # Graph-specific validation
│   │   ├── connection-validator.ts   # Connection rules
│   │   ├── node-palette.tsx          # Strands node palette
│   │   ├── config/                   # Strands config panels
│   │   │   ├── agent-advanced-config.tsx
│   │   │   ├── agent-plugins-config.tsx
│   │   │   ├── advanced-features-config.tsx
│   │   │   ├── guardrails-config.tsx
│   │   │   ├── observability-config.tsx
│   │   │   └── model-provider-config.tsx
│   │   └── deploy/                   # Strands deploy panels
│   │       ├── deploy-panel.tsx
│   │       ├── agentcore-deploy-panel.tsx
│   │       ├── lambda-deploy-panel.tsx
│   │       ├── ecs-deploy-panel.tsx
│   │       └── deploy-progress.tsx
│   │
│   └── google-adk/                  # Google ADK adapter
│       ├── index.ts                 # Exports ADKAdapter
│       ├── adapter.ts              # Implements FrameworkAdapter
│       ├── nodes/                   # ADK node components
│       │   ├── index.tsx            # Node type registry
│       │   ├── llm-agent-node.tsx   # LlmAgent (main reasoning agent)
│       │   ├── sequential-agent-node.tsx  # SequentialAgent
│       │   ├── parallel-agent-node.tsx    # ParallelAgent
│       │   ├── loop-agent-node.tsx        # LoopAgent
│       │   ├── custom-agent-node.tsx      # Custom BaseAgent
│       │   ├── function-tool-node.tsx     # FunctionTool
│       │   ├── mcp-tool-node.tsx          # MCPToolset
│       │   ├── builtin-tool-node.tsx      # Google Search, Code Exec
│       │   ├── a2a-tool-node.tsx          # Agent-to-Agent tool
│       │   ├── input-node.tsx             # Input (shared styling)
│       │   └── output-node.tsx            # Output (shared styling)
│       ├── code-generator.ts        # ADK Python code generation
│       ├── model-providers.ts       # Gemini, Vertex AI, LiteLLM
│       ├── model-code-generator.ts  # ADK model instantiation
│       ├── callbacks-codegen.ts     # ADK callbacks code
│       ├── guardrails-codegen.ts    # ADK guardrails
│       ├── session-codegen.ts       # ADK session/state management
│       ├── flow-validator.ts        # ADK validation rules
│       ├── connection-validator.ts  # ADK connection rules
│       ├── node-palette.tsx         # ADK node palette
│       ├── config/                  # ADK config panels
│       │   ├── agent-config.tsx     # Main agent configuration
│       │   ├── callbacks-config.tsx # Before/after model/tool callbacks
│       │   ├── guardrails-config.tsx# ADK guardrails
│       │   ├── session-config.tsx   # State & session management
│       │   └── model-provider-config.tsx # Gemini/Vertex config
│       └── deploy/                  # ADK deploy panels
│           ├── deploy-panel.tsx     # Main deploy panel
│           ├── vertex-deploy-panel.tsx    # Vertex AI Agent Engine
│           └── cloudrun-deploy-panel.tsx  # Cloud Run
│
└── context/
    └── framework-context.tsx         # React Context for active framework
```

---

## Framework Adapter Interface

```typescript
// src/frameworks/types.ts

export type FrameworkId = 'strands' | 'google-adk';

export interface FrameworkAdapter {
  id: FrameworkId;
  name: string;
  description: string;
  icon: string; // Path or component
  version: string; // SDK version supported

  // Node system
  getNodeTypes(): Record<string, React.ComponentType<any>>;
  getNodePalette(): React.ComponentType;
  getDefaultNodes(): Node[];

  // Code generation
  generateCode(nodes: Node[], edges: Edge[]): string;

  // Validation
  validateFlow(nodes: Node[], edges: Edge[]): ValidationIssue[];
  validateConnection(source: Node, target: Node, sourceHandle?: string): boolean;

  // Configuration panels
  getPropertyPanel(node: Node): React.ComponentType<PropertyPanelProps>;
  getDeployPanel(): React.ComponentType;

  // Model providers
  getModelProviders(): ModelProvider[];

  // Templates
  getTemplates(): Promise<Template[]>;
}
```

---

## Google ADK Node Types (Mapped to SDK)

| ADK Concept | Node Type | Color | Description |
|-------------|-----------|-------|-------------|
| `LlmAgent` (alias `Agent`) | `adk-llm-agent` | Blue | Main reasoning agent with LLM |
| `SequentialAgent` | `adk-sequential` | Purple | Runs sub-agents in order |
| `ParallelAgent` | `adk-parallel` | Orange | Runs sub-agents concurrently |
| `LoopAgent` | `adk-loop` | Teal | Repeats sub-agents until condition |
| Custom `BaseAgent` | `adk-custom-agent` | Gray | User-defined orchestration |
| `FunctionTool` | `adk-function-tool` | Green | Python function as tool |
| `MCPToolset` | `adk-mcp-tool` | Cyan | MCP server tools |
| Built-in Tools | `adk-builtin-tool` | Yellow | google_search, code_execution |
| A2A Tool | `adk-a2a-tool` | Pink | Agent-to-Agent protocol |
| Input | `adk-input` | Slate | Flow input |
| Output | `adk-output` | Slate | Flow output |

---

## Google ADK Code Generation Example

```python
# Generated by Agent Builder (Google ADK)
from google.adk.agents import LlmAgent, SequentialAgent, ParallelAgent
from google.adk.models.gemini import Gemini
from google.adk.tools import FunctionTool, MCPToolset
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

# Define tools
def search_web(query: str) -> dict:
    """Search the web for information."""
    # Implementation
    return {"results": []}

search_tool = FunctionTool(func=search_web)

# Define agents
researcher = LlmAgent(
    name="researcher",
    model=Gemini(model="gemini-2.0-flash"),
    instruction="You are a research assistant...",
    tools=[search_tool],
)

writer = LlmAgent(
    name="writer",
    model=Gemini(model="gemini-2.0-flash"),
    instruction="You are a content writer...",
)

# Orchestrator
pipeline = SequentialAgent(
    name="research_pipeline",
    sub_agents=[researcher, writer],
)

# Run
session_service = InMemorySessionService()
runner = Runner(agent=pipeline, app_name="my_app", session_service=session_service)
```

---

## Framework Selector Page Design

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│                    🏗️ AgenticBuilder                         │
│                                                                    │
│           Choose your AI agent framework to get started            │
│                                                                    │
│    ┌─────────────────────────┐    ┌─────────────────────────┐    │
│    │    ⚡ Strands Agents    │    │    🧪 Google ADK         │    │
│    │                         │    │                         │    │
│    │  Build agents with the  │    │  Build agents with      │    │
│    │  Strands SDK. Multi-    │    │  Google's Agent Dev Kit │    │
│    │  agent orchestration,   │    │  LlmAgent, Workflow     │    │
│    │  Graph, Swarm, A2A.     │    │  agents, Gemini-first.  │    │
│    │                         │    │                         │    │
│    │  Python · AWS · 15+     │    │  Python · GCP · Gemini  │    │
│    │  model providers        │    │  Vertex AI · MCP        │    │
│    │                         │    │                         │    │
│    │  SDK v1.47.0            │    │  SDK v1.28.0            │    │
│    │                         │    │                         │    │
│    │      [ Start → ]        │    │      [ Start → ]        │    │
│    └─────────────────────────┘    └─────────────────────────┘    │
│                                                                    │
│           ─── Recently Opened ───                                 │
│    project-1.json (Strands) · project-2.json (ADK)               │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Infrastructure)
1. Create `src/frameworks/types.ts` — adapter interface
2. Create `src/frameworks/registry.ts` — framework registry
3. Create `src/context/framework-context.tsx` — React Context
4. Create `src/pages/framework-selector.tsx` — selector page
5. Update `App.tsx` — route between selector and builder
6. Update `main-layout.tsx` — consume framework context

### Phase 2: Refactor Strands (Move to Adapter Pattern)
1. Move all Strands nodes → `src/frameworks/strands/nodes/`
2. Move code generators → `src/frameworks/strands/`
3. Move config panels → `src/frameworks/strands/config/`
4. Move deploy panels → `src/frameworks/strands/deploy/`
5. Create `src/frameworks/strands/adapter.ts`
6. Verify everything still works after refactor

### Phase 3: Google ADK Adapter
1. Create ADK node components in `src/frameworks/google-adk/nodes/`
2. Create ADK code generator
3. Create ADK model providers (Gemini, Vertex AI, LiteLLM)
4. Create ADK config panels (callbacks, guardrails, session)
5. Create ADK flow validator
6. Create ADK node palette
7. Create ADK deploy panels (Vertex AI, Cloud Run)

### Phase 4: Integration & Polish
1. Connect framework selector → builder flow
2. Update project manager to store framework ID
3. Add framework-specific templates to DB
4. Backend: Add ADK execution support
5. Backend: Add ADK deployment targets
6. Test end-to-end both frameworks
7. Update README

---

## Google ADK — Key Differences from Strands

| Aspect | Strands | Google ADK |
|--------|---------|------------|
| Agent creation | `Agent(tools=[], model=...)` | `LlmAgent(name=..., model=..., tools=[])` |
| Multi-agent | Graph, Swarm, A2A, Workflow | SequentialAgent, ParallelAgent, LoopAgent |
| Tools | `@tool` decorator | `FunctionTool(func=...)` |
| MCP | `MCPClient(...)` | `MCPToolset(...)` |
| Model providers | 15+ (Bedrock, OpenAI, etc.) | Gemini, Vertex AI, LiteLLM, Ollama, Anthropic |
| Hooks/Callbacks | `HookProvider` classes | `before_model_callback`, `after_model_callback`, etc. |
| Session | `SessionManager` | `SessionService` (InMemory, Database) |
| State | `invocation_state` | `session.state` dict |
| Deployment | AWS (Lambda, ECS, AgentCore) | GCP (Vertex AI Agent Engine, Cloud Run) |
| Guardrails | Bedrock Guardrails, Agent Control | Callbacks returning modified/blocked content |
| A2A | Built-in A2A agent node | `to_a2a()` method on runner |

---

## Backend Changes Required

```
backend/
├── main.py                          # Add /api/adk/* routes
├── app/
│   ├── strands_executor.py          # Existing Strands execution
│   └── adk_executor.py              # NEW: ADK execution engine
├── deployment/
│   ├── agentcore/                   # Existing
│   ├── lambda/                      # Existing
│   ├── ecs-fargate/                 # Existing
│   ├── vertex-ai/                   # NEW: Vertex AI Agent Engine
│   └── cloud-run/                   # NEW: Cloud Run
└── pyproject.toml                   # Add google-adk dependency
```

---

## Database Changes

```sql
-- Add framework column to projects
ALTER TABLE projects ADD COLUMN framework VARCHAR(20) DEFAULT 'strands';

-- Add framework column to templates
ALTER TABLE templates ADD COLUMN framework VARCHAR(20) DEFAULT 'strands';

-- Seed ADK templates
INSERT INTO templates (name, framework, ...) VALUES
  ('ADK Research Pipeline', 'google-adk', ...),
  ('ADK Multi-Agent Chat', 'google-adk', ...);
```

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing Strands functionality | High | Phase 2 is purely a move/refactor — validate before proceeding |
| ADK API changes | Medium | Pin to specific ADK version, use adapter pattern |
| Shared component bloat | Low | Framework context keeps components lean |
| Backend complexity | Medium | Separate executor files per framework |

---

## Success Criteria

1. ✅ Landing page lets user choose Strands or Google ADK
2. ✅ Existing Strands builder works identically after refactor
3. ✅ ADK builder generates valid Python code with correct imports
4. ✅ ADK nodes cover: LlmAgent, Sequential, Parallel, Loop, FunctionTool, MCPToolset
5. ✅ ADK code runs via backend execution panel
6. ✅ Projects save with framework metadata
7. ✅ Templates load per-framework
8. ✅ Both frameworks share same visual editor UX

---

## Timeline Estimate

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1: Foundation | 2-3 hours | None |
| Phase 2: Strands Refactor | 4-6 hours | Phase 1 |
| Phase 3: ADK Adapter | 6-8 hours | Phase 2 |
| Phase 4: Integration | 3-4 hours | Phase 3 |
| **Total** | **15-21 hours** | |

---

## References

- [Strands Agents SDK](https://strandsagents.com/) — v1.47.0
- [Google ADK Docs](https://google.github.io/adk-docs/) — About, Agents, Tools, Callbacks
- [Google ADK GitHub](https://github.com/google/adk-python) — v1.28.0
- [ADK Multi-Agent Patterns](https://google.github.io/adk-docs/agents/custom-agents/)
- [ADK MCP Tools](https://google.github.io/adk-docs/tools-custom/mcp-tools/)
- [ADK Callbacks](https://google.github.io/adk-docs/callbacks/)
