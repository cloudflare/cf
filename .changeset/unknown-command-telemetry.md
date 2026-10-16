---
"cf": minor
---

Record sanitised detail about unrecognised commands in usage telemetry

When `cf` cannot match the arguments to a command, telemetry now records the
kind of failure, the recognised part of the command path, whether that part is
a complete command, and up to three unrecognised words. A word is included only
when it is a `cf` command name in a place where a command name was expected;
anything else, including any extra value after a complete command, is replaced
by a category such as `<hex>`, `<domain>`, or `<path>`. Unrecognised flags are
counted, never named.

Failures inside a group or command keep the `command` value they were reported
under before. Failures at the top level that were previously dropped – a typo
with a suggestion, several unknown words, or only flags with no command – are
now reported as unknown commands.
