---
"cf": patch
---

Bump the `@cloudflare/forge` pin to build
`f6720c19250f90fe5b395ef2c38d488aaba31641` (Forge 0.2.0, which moved SDK
generation under a `generate` subcommand) and invoke the CLI via
`forge generate` so `pnpm generate` keeps working.
