---
"cf": patch
---

Resolve required input before showing dry-run previews

Read piped secret values and prompt for missing required fields during dry runs, just as during execution. Reject missing required body input instead of showing an incomplete successful preview, while continuing to redact secrets and skip authentication and API requests.
