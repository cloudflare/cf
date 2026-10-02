---
"cf": patch
---

Keep CLI usage errors concise

Exit with an error for unknown top-level and nested command names followed by `--help` or `-h`. Show a concise error and relevant help hint for unknown commands, and show the leaf command's help after an unknown flag. Unknown global flags point to `cf --help` for the list of global flags.
