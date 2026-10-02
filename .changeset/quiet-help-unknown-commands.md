---
"cf": patch
---

Keep CLI usage errors concise

Exit with an error for unknown top-level command names followed by `--help` or `-h`, matching Wrangler's validation. For usage errors, show the error and an italic suggestion for the nearest valid `cf ... --help` command instead of printing the full help first.
