---
"cf": patch
---

Honor explicitly shared development registries

Let cf use an exported `WRANGLER_REGISTRY_PATH` or `MINIFLARE_REGISTRY_PATH`
to connect to other development processes without changing its default config
directory or adopting Wrangler's legacy paths. `CLOUDFLARE_REGISTRY_PATH` takes
precedence, followed by `WRANGLER_REGISTRY_PATH` and `MINIFLARE_REGISTRY_PATH`.
The selected path is passed consistently to development-server implementations
and used by local commands.
