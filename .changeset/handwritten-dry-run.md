---
"cf": minor
---

Add `--dry-run` to hand-written commands

Validate arguments and preview hand-written commands without executing their handlers. Commands with existing dry-run implementations retain their command-specific previews. Require every hand-written command to declare a dry-run strategy and option during generation.
