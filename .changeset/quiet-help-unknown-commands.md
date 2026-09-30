---
"cf": patch
---

Keep CLI usage errors concise

Exit with an error for unknown top-level and nested command names followed by `--help` or `-h`. For usage errors, show the error and an italic suggestion for the nearest valid `cf ... --help` command instead of printing the full help first.
