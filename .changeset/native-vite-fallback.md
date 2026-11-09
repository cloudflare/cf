---
"cf": minor
---

Run Vite and Vite+ commands selected by autoconfig

Stop requiring the experimental internal `cf-vite` executable from `@cloudflare/vite-plugin`. Autoconfig selects the project's installed Vite or Vite+ executable for dev, build, and workflows that build before deploying, including projects without a detected framework command. cf executes the returned commands with argument forwarding, plugin compatibility checks, and Preview context. Configure `cloudflare({ remoteBindings: false })` instead of passing the removed delegate's `--local` flag.
