---
"cf": patch
---

Reject D1 migration names that cannot be stored on Windows

`cf d1 migrations create` now rejects names containing `:`, `*`, `?`, `"`,
`<`, `>`, or `|`. On NTFS a `:` wrote the SQL into a hidden alternate data
stream of an empty file, so the migration was never applied and the next one
reused its number. The other characters failed with a raw filesystem error.
