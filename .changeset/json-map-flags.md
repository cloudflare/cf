---
"cf": minor
---

Add JSON map flags and require explicit tags for CWS updates.

Supply map fields as inline JSON objects or `@path/to/file.json`, preserving
empty maps and nested values. CWS policy, policy set, workload, and deployment
updates now require a tag map, including in `--body`; pass `{}` to clear tags
explicitly instead of silently losing them when tags are omitted.
