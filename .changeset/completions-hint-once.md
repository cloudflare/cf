---
"cf": patch
---

Show the shell completions tip at most once, and never in CI

cf now saves that it has shown the tip before it prints it. If cf cannot write
its state file, the tip no longer appears on every run. CI runners that attach
a terminal no longer see the tip.
