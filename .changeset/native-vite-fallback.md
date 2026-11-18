---
"cf": minor
---

Run the project's own Vite or Vite+ commands

`cf dev`, `cf build` and `cf deploy` now run the project's installed `vite` or `vp` (Vite+) instead of the internal `cf-vite` executable from `@cloudflare/vite-plugin` when autoconfig identifies it as a Vite project. If you were running `cf dev -- --local`, set `remoteBindings: false` in `cloudflare()` to turn off remote bindings.

Stopping cf now also stops tools that launchers such as `vp` start, and on macOS and Linux a second Ctrl+C force-stops the command.
