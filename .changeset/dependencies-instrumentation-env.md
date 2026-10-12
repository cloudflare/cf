---
"cf": patch
---

Allow dependency metadata uploads to be disabled with an environment variable

Set `CLOUDFLARE_DEPENDENCIES_INSTRUMENTATION=false` to omit npm package dependency metadata from Worker deploys and version uploads. The variable can also be set in cf's supported `.env` files.
