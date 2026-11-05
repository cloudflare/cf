---
"cf": minor
---

Store `--local` state in the project's `.cloudflare/state` directory

`--local` commands now use `.cloudflare/state` next to the nearest `cloudflare.config.ts`, the same directory `cf dev` writes to, so commands like `cf kv keys list --local` see the data your dev server created.

This is a breaking change: `--local` no longer defaults to the global state directory, and it fails outside a project unless you pass `--persist-to <dir>`. To keep using existing global state, pass `--persist-to` with the `state` directory under cf's config directory (for example `~/.config/cloudflare/state` on Linux or `~/Library/Preferences/cloudflare/state` on macOS).
