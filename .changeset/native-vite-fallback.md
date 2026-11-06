---
"cf": minor
---

Run Vite fallback commands through the project's native Vite CLI

Stop requiring the experimental internal `cf-vite` executable from `@cloudflare/vite-plugin`. When no framework command is detected, `cf dev`, `cf build`, and workflows that build before deploying now use the project's installed Vite CLI while retaining plugin compatibility checks and Preview build context. Install Vite alongside the plugin; configure `cloudflare({ remoteBindings: false })` instead of passing the removed delegate's `--local` flag.
