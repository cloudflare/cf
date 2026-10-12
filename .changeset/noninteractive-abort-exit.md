---
"cf": minor
---

Fail destructive commands when noninteractive confirmation is unavailable

Breaking change during the beta: destructive commands invoked without a terminal
or in CI now exit with status 1 when `--force` is omitted, instead of reporting
success after aborting. The command still prints confirmation guidance and makes
no mutation request. Interactive declines retain their existing exit behavior.
