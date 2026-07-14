# SDK Verification Report — July 14, 2026

## Summary of Findings

### Strands Agents SDK ✅ Mostly Correct (1 import fix needed)
- **Latest version**: v1.47.0 (July 10, 2026)
- **Our target**: v1.47.0 ✅ Current
- **Breaking imports**: 1 fix needed (BedrockModel path)
- **Status**: Minor update required

### Google ADK ⚠️ MAJOR UPDATE NEEDED
- **Latest version**: v2.4.0 (July 7, 2026) — **v2.x is a major rewrite**
- **Our target**: v1.28.0 — 1.x branch still maintained (latest 1.x = v1.36.1)
- **Breaking imports**: 5 fixes needed even for 1.x compatibility
- **Decision needed**: Target v1.36.x (safe) or migrate to v2.x (major effort)

---

## Decision: ADK Version Target

**Recommended: Target v1.36.x (latest 1.x) for now, plan v2.x migration as Phase 5**

Rationale:
- v2.x is a major architectural rewrite with Workflow engine, new imports, deprecated patterns
- v1.x is still maintained in parallel (1.36.1 released recently)
- Our current imports work on 1.x with minor fixes
- v2.x migration would be a separate sprint (new node types, new code-gen, new imports)

**Updated target: google-adk v1.36.x**

---

## Import Fixes Required

### Strands (1 fix)

| Current (WRONG) | Correct |
|-----------------|---------|
| `from strands.models import BedrockModel` | `from strands.models.bedrock import BedrockModel` |

All other imports verified correct:
- `from strands import Agent, tool` ✅
- `from strands.multiagent import GraphBuilder, Swarm` ✅
- `from strands.tools.mcp import MCPClient` ✅
- `from strands import ModelRetryStrategy` ✅
- `from strands.agent.conversation_manager import SlidingWindowConversationManager` ✅
- `from strands.session import FileSessionManager` ✅
- `from strands.hooks import HookProvider, HookRegistry` ✅

### Google ADK (5 fixes for v1.36.x compatibility)

| Current (WRONG) | Correct (v1.36.x) |
|-----------------|---------|
| `from google.adk.models.gemini import Gemini` | `from google.adk.models import Gemini` |
| `from google.adk.models.lite_llm import LiteLlm` | `from google.adk.models import LiteLlm` |
| `from google.adk.tools import code_execution` | REMOVED — use model built-in capability |
| `from google.adk.tools.mcp_tool import SseServerParams` | `from google.adk.tools.mcp_tool import SseConnectionParams` |
| `from google.adk.tools.mcp_tool import StdioServerParameters` | `from google.adk.tools.mcp_tool import StdioConnectionParams` |

Confirmed still correct:
- `from google.adk.agents import LlmAgent, SequentialAgent, ParallelAgent, LoopAgent` ✅
- `from google.adk.tools import FunctionTool, google_search` ✅
- `from google.adk.runners import Runner` ✅
- `from google.adk.sessions import InMemorySessionService, DatabaseSessionService, VertexAiSessionService` ✅
- `from google.adk.agents.callback_context import CallbackContext` ✅

---

## New Features Available (Not Yet in Builder)

### Strands v1.45-1.47 (should add)
- MemoryManager (cross-session long-term memory)
- MCPClient `continue_on_error` param
- MCP from JSON config
- Span Redaction (OTEL)
- Context Offloader (auto-compress large tool results)

### Google ADK v1.29-1.36 (should add for 1.x)
- StreamableHTTPConnectionParams for MCP
- Additional built-in tools (google_maps_grounding, url_context)
- LongRunningFunctionTool
- Improved A2A support (to_a2a on workflows)

### Google ADK v2.x (future Phase 5)
- Workflow first-class concept
- Graph Workflows with conditional edges
- ManagedAgent type
- request_input, transfer_to_agent, exit_loop tools
- App() wrapper for Runner
- RunConfig class
- Model routing
- Context compression/caching
- Claude/Gemma4 model support
- Default model: gemini-3-flash-preview

---

## Action Items

1. ✅ Fix Strands BedrockModel import in code generator
2. ✅ Fix ADK model imports (flatten path)
3. ✅ Fix ADK MCP tool param names (SseConnectionParams, StdioConnectionParams)
4. ✅ Remove code_execution from ADK built-in tools (use model capability instead)
5. ✅ Update RELEASE_TRACKING.md with new version targets
6. 🔲 (Future) Plan ADK v2.x migration as separate phase
