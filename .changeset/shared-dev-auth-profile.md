---
"cf": minor
---

Pass the selected auth profile to development servers

`cf dev --profile <name>` now sets `CLOUDFLARE_AUTH_PROFILE` for child processes, including framework development commands and the `cf-vite` and `cf-wrangler` delegates. This overrides an inherited profile without passing an unsupported command-line argument.

Experimental cf delegates now require Wrangler 4.159.0 or newer, or Cloudflare Vite plugin v2 starting at 2.0.0-beta.v.13. Older delegates are rejected even when no profile is specified, so they cannot silently use credentials from another profile. Framework development servers need `@cloudflare/workers-auth` 0.17.0 or newer to use the selected credentials.
