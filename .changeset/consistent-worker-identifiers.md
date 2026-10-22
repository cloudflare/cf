---
"cf": patch
---

Use `--worker` consistently across generated `cf workers` commands

Accept `--worker` for Worker and version operations that previously required
`--worker-id` or a positional Worker identifier. Keep `--worker-id` and
`--script-name` as aliases, and retain positional input for `cf workers get`
and `cf workers delete`.
