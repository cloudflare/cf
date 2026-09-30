---
"cf": patch
---

Preserve existing Worker secrets during `cf deploy`

Update `@cloudflare/deploy-helpers` to inherit secret bindings from the previous Worker version, including secrets that are not declared in `cloudflare.config.ts`. This prevents a redeploy from removing secrets added through the API or CLI.
