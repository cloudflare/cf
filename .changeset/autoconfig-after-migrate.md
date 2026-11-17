---
"cf": minor
---

Set up supported frameworks after migrating a Wrangler project

When `cf dev`, `cf build`, or `cf deploy` migrates a Wrangler project and autoconfig detects a framework it can set up for cf, the migration now uses the Vite bundler and cf continues into that framework's setup, which merges into the migrated `cloudflare.config.ts`. Previously cf stopped after the migration, so a framework project such as Astro stayed on the Wrangler bundler unless it already declared `@cloudflare/vite-plugin`. Projects without such a framework still migrate as before.
