---
"cf": patch
---

Hide the unsupported `--profile` flag from `cf auth list` and `cf auth logout` help

Both commands reject `--profile` with a usage error, but their help screens listed it among the global flags. The flag no longer appears in their help; passing it still reports the same error, and named-profile removal still uses `cf auth delete <name>`.
