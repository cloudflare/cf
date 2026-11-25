---
"cf": minor
---

Remove `cf zero-trust risk-scoring` commands no longer in the API schema

Breaking change: under `cf zero-trust risk-scoring`, the `get`, `reset`,
`behaviours get`, `behaviours update`, and `summary get` commands are no longer
available. Update scripts that call them before upgrading. Commands under
`cf zero-trust risk-scoring integrations` remain available.
