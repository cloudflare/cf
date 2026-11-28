---
"cf": minor
---

Set up the project's framework in `cf migrate`

`cf migrate` now detects the project, migrates its Worker settings to `cloudflare.config.ts`, sets up its framework, then migrates its build settings for the bundler that setup chose. `--bundler` applies when setup doesn't choose one, and `--no-install` skips setup along with installs.
