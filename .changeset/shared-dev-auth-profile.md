---
"cf": patch
---

Pass the selected auth profile to development servers

`cf dev --profile <name>` now sets `CLOUDFLARE_AUTH_PROFILE` for child processes, including framework development commands and the `cf-vite` and `cf-wrangler` delegates. This overrides an inherited profile without passing an unsupported command-line argument. Development servers need a version of `@cloudflare/workers-auth` that supports this shared environment variable to use the selected credentials.
