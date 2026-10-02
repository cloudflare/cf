---
"cf": patch
---

Launch Node delegates through Execa on Windows

Wrangler and Vite delegation now works for `cf dev`, `cf build`, and
build-backed deploy commands without `spawn EFTYPE`. Execa uses the delegates'
Node shebangs on Windows and preserves argument boundaries without a shell.
