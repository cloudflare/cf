---
"cf": patch
---

Use cf-owned command and configuration guidance in shared deployment helpers

cf now passes its command paths and `cloudflare.config.ts` syntax directly to the shared deployment and Container operations that need them. These values no longer depend on a global presentation adapter or Wrangler fallback.
