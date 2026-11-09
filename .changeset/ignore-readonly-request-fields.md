---
"cf": patch
---

Ignore read-only fields in request validation

Omit server-provided read-only fields from input flags, prompts, request constants, and validation messages, even when shared schemas mark them required. Ignore supplied read-only values while continuing to validate writable fields.

Preserve annotations across nested objects, arrays, tuples, maps, and sibling `allOf` clauses. Skip conditions selected by response-only fields. Apply the same handling to multipart forms, and send `{}` automatically for JSON objects and union variants whose only declared properties are read-only.
