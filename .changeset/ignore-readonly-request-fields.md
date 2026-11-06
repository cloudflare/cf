---
"cf": patch
---

Ignore read-only fields in request validation

Omit server-provided read-only fields from input flags, prompts, and validation messages, even when shared request/response schemas mark them required. Ignore supplied read-only values during local validation while preserving checks for writable fields.
