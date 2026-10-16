---
"cf": minor
---

Support nested JSON array body flags

Accept arrays of objects at nested body paths and arrays of arrays as single JSON flags, including `@file` input. Include these fields in required-field checks so partial flag groups cannot omit required arrays. This adds flags to generated commands, including `--intent-clauses` and `--query-branches` on priority-intelligence create and update.
