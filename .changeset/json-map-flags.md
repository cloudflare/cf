---
"cf": minor
---

Add JSON map flags for API request fields.

Supply map fields as inline JSON objects or `@path/to/file.json`, preserving
empty maps and nested values. Required map fields must also be present when
using `--body`.
