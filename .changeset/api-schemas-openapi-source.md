---
"cf": minor
---

Generate commands from the Cloudflare API schemas repository

The generated command surface now comes from `openapi.json` in
cloudflare/api-schemas, pinned to revision
`3caa09607da12e7b79d55b704a20e2cf4ad8af53`. `cf stream webhooks update`
accepts `--notification-url`, and `cf url-scanner scans create` reflects the
current set of supported scan countries.
