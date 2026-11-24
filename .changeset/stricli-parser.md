---
"cf": minor
---

Parse CLI arguments with Stricli instead of yargs.

Keep the existing command names and flags. Explicit boolean values must be `true` or `false`; malformed values such as `--force=maybe` are rejected before the command runs.
