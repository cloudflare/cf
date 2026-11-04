---
"cf": patch
---

Validate `--body` before confirmation prompts

Commands that ask for confirmation now parse `--body`, and enforce its item
limit, before authenticating or prompting, so a malformed body fails without
asking you to confirm first. On JSON endpoints, an empty `--body ""` is now
rejected as invalid JSON instead of being ignored, and `--dry-run` shows the
`--file` path for raw-body uploads.
