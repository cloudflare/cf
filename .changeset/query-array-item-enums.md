---
"cf": patch
---

Validate enum values in query-array flags

Preserve choices from inline and referenced array item schemas so invalid
values are rejected before an API request. Valid single and repeated values
continue to be passed as arrays, and comma-joined query parameters continue to
accept comma-separated input.
