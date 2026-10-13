---
"cf": patch
---

Forward arguments to detected development servers

Pass development-server arguments through `cf dev` when a framework command is
detected, so Vite projects can use `--port` and `--host`. Preserve arguments after
`--` and preserve argument boundaries, including paths containing spaces.
