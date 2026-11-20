---
"cf": patch
---

Allow `null` for JSON object-array flags when the API schema permits it. For example, `cf mcp servers update <id> --updated-tools null` resets the tool overrides to absent rather than setting an empty list.
