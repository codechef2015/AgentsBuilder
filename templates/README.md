# Flow Templates

Pre-built flow templates demonstrating Strands SDK multi-agent patterns. Import any template into the builder to get started quickly.

## Template Sources

All templates are based on official Strands SDK documentation and community patterns:
- [Strands SDK Multi-Agent Patterns](https://strandsagents.com/docs/user-guide/concepts/multi-agent/multi-agent-patterns/)
- [Strands Agents: Interesting Multi-Agent Pattern](https://levelup.gitconnected.com/strands-agents-interesting-multi-agent-pattern-0c7f97088b6d) by Itsuki
- [Strands SDK Graph Documentation](https://strandsagents.com/docs/user-guide/concepts/multi-agent/graph/)

## Available Templates

| # | Template | Pattern | Description |
|---|----------|---------|-------------|
| 1 | Simple Agent | Single Agent | Basic agent with tools |
| 2 | Orchestrator with Sub-Agents | Agents as Tools | Supervisor delegating to specialists |
| 3 | Static Swarm | Swarm | Team of agents with autonomous handoff |
| 4 | Sequential Graph | Graph (Pipeline) | A → B → C → D linear flow |
| 5 | Parallel Graph | Graph (Fan-out/Fan-in) | One input, parallel workers, aggregator |
| 6 | Branching Graph | Graph (Conditional) | Classifier routing to different specialists |
| 7 | Feedback Loop Graph | Graph (Cyclic) | Writer → Reviewer → Writer until approved |
| 8 | A2A Distributed | A2A + Graph | Local orchestration + remote specialized agents |
| 9 | Workflow Pipeline | Workflow | DAG-based task pipeline with dependencies |

## Database Storage

Templates are stored in MySQL for persistence, versioning, and sharing.
See `backend/db/migrations/` for schema.
