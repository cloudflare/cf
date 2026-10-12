---
"cf": patch
---

Launch Node delegates through tinyexec on Windows

Wrangler and Vite delegation now works for `cf dev`, `cf build`, and
build-backed deploy commands without `spawn EFTYPE`. tinyexec uses the delegates'
Node shebangs on Windows and preserves argument boundaries without a shell.
