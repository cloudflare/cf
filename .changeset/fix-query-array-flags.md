---
"cf": patch
---

Preserve arrays in generated query parameter flags

Accept multiple values after a query array flag, such as `--ids first second`,
while retaining support for repeated flags. Parse single values as arrays and
preserve each operation's repeated-key or comma-separated query serialization.
