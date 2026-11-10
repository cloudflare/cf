---
"cf": patch
---

Deploy to the Worker named by `CLOUDFLARE_WORKER_NAME`

`cf deploy`, `cf previews deploy`, `cf workers versions create`, and
`cf workers triggers deploy` now use `CLOUDFLARE_WORKER_NAME`, the environment
equivalent of `worker.name`, as the selected Worker's name. Workers Builds sets
it to the connected Worker, so production deployments and Previews stay attached
to that Worker even when `cloudflare.config.ts` uses a different name. Other
Workers in the Build Output keep their configured names.
