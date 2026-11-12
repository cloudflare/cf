---
"cf": minor
---

Require Wrangler 4.161.0 or newer for the `cf-wrangler` delegate

cf no longer sets the `CLOUDFLARE_CF_AUTH` environment variable for its development servers. Older Wrangler versions read it to choose cf's credentials when they restarted a remote bindings session, for example after you removed the last remote binding during `cf dev`. Wrangler 4.161.0 keeps using cf's credentials without it, so cf now rejects older Wrangler delegates with an upgrade hint.
