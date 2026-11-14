---
"cf": minor
---

Support the Cloudflare config 1.0 release candidate and Build Output v1

cf now reads and writes Build Output under `.cloudflare/output/v1/`. The root
`config.json` keeps account settings under `settings` and records cf as its
`producer`. Output in the older v0 format is rejected, so rebuild projects
before deploying them with this release.

Container `max_instances` defaults to 20 when the config leaves it unset,
matching Wrangler.

`cf dev`, `cf build`, `cf deploy` and `cf previews deploy` now require
`@cloudflare/vite-plugin` 2.0.0-rc.0 or newer, and `cf init` scaffolds new
projects with `@cloudflare/vite-plugin@^2.0.0-rc.0`.
