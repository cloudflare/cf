---
"cf": minor
---

Opt out of dependency metadata uploads with `CLOUDFLARE_DEPENDENCIES_INSTRUMENTATION=false`

`cf deploy` sent npm package metadata on every upload with no way to turn it off, so Wrangler projects using `dependencies_instrumentation: { enabled: false }` silently opted back in after `cf migrate`. Setting `CLOUDFLARE_DEPENDENCIES_INSTRUMENTATION=false` now leaves `package_dependencies` out of Worker uploads, and the migrate follow-up for dropped dependency instrumentation points at it. The `cloudflare.config.ts` worker field still needs upstream schema support.
