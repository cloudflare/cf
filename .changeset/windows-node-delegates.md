---
"cf": patch
---

Launch Node delegates through Node on Windows

Wrangler and Vite delegation now works for `cf dev`, `cf build`, and
build-backed deploy commands without `spawn EFTYPE`.
Arguments continue to pass directly to the delegate without a shell.
