---
"cf": minor
---

Treat any `AI_AGENT` value as an AI coding agent.

When `AI_AGENT` names an agent that `cf` has no detector for, `cf` now treats the run as agentic and records the agent as `unknown`, along with the name it gives. Claude Code is also recognised from its `AI_AGENT` value, and its version is recorded in telemetry.
