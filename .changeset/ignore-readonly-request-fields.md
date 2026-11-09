---
"cf": patch
---

Ignore read-only fields in request validation

Omit server-provided read-only fields from input flags, prompts, and validation messages, even when shared request/response schemas mark them required. Ignore supplied read-only values during local validation while preserving checks for writable fields.

Preserve read-only annotations for nested properties split across sibling `allOf` clauses without applying annotations from unrelated parent fields.
