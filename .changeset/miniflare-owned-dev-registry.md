---
"cf": minor
---

Delegate development registry resolution to Miniflare

During the cf beta, stop overriding registry paths for `cf dev` and `--local`.
Miniflare v5 owns the default `<Cloudflare config directory>/dev-registry/v5`
and the `CLOUDFLARE_DEV_REGISTRY_PATH` override. cf no longer interprets
`CLOUDFLARE_REGISTRY_PATH` or translates registry settings for child processes;
exported environment variables reach the selected project tooling unchanged.

Wrangler retains its own default registry for compatibility. Set the same
`CLOUDFLARE_DEV_REGISTRY_PATH` for cf and compatible Wrangler/Vite processes when
they need to share development resources.
