---
"cf": patch
---

Deploy to the Worker named by `CLOUDFLARE_CI_OVERRIDE_WORKER_NAME`

`cf deploy`, `cf previews deploy`, `cf workers versions create`, and
`cf workers triggers deploy` now deploy the selected Worker under
`CLOUDFLARE_CI_OVERRIDE_WORKER_NAME` when it is set, matching Wrangler's
`WRANGLER_CI_OVERRIDE_NAME`. Workers Builds sets it to the connected Worker, so
production deployments and Previews stay attached to that Worker even when
`cloudflare.config.ts` uses a different name. cf warns when the names differ
and reports the override in the output file. Other Workers and binding targets
are unchanged.

`cf deploy` and `cf workers versions create` also accept
`CLOUDFLARE_CI_MATCH_WORKER_TAG`, the equivalent of `WRANGLER_CI_MATCH_TAG`, and
fail when the deployed Worker's tag differs.
