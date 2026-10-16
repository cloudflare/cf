---
"cf": minor
---

Record sanitised detail about unrecognised commands in usage telemetry

When `cf` cannot match the arguments to a command, telemetry now records the
kind of failure, the recognised part of the command path, whether that part is
a complete command, and up to three unrecognised words. A word is included only
when it is a `cf` command name; anything else is replaced by a category such as
`<hex>`, `<domain>`, or `<path>`. Unrecognised flags are counted, never named.
Typos with a suggestion, several unknown words, and flag-only invocations are
now reported as unknown commands instead of being dropped.
