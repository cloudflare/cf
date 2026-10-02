---
"cf": patch
---

Recognize explicit boolean values before commands

When a global boolean flag or alias is followed by `true` or `false`, treat the literal as its value while identifying the command. This keeps invocations such as `cf --local false complete bash` from receiving the wrong startup behavior.
