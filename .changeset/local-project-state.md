---
"cf": patch
---

Store `--local` state in the project's `.cloudflare/state` directory

`--local` commands now use `.cloudflare/state` next to the nearest `cloudflare.config.ts`, the same directory `cf dev` writes to, so commands like `cf kv keys list --local` see the data your dev server created. Outside a project, pass `--persist-to <dir>` to choose where local state is stored.
