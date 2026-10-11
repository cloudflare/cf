---
"cf": patch
---

Use the configured project's commands on the first `cf dev` or `cf build` after setup

When `cf dev` or `cf build` set up a project, they kept the commands and environment detected before setup. If setup changes the project's tooling, for example by setting up a Next.js project with vinext, the first run would use the old commands. cf now analyses the project again after setup, as it already did after converting a Wrangler config.
