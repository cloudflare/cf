---
"cf": minor
---

Load `cloudflare.config.ts` when `cf` runs on Bun

Running `cf` on the Bun runtime inside a project directory aborted every command with "cloudflare.config.ts loading is not supported on Bun". `loadProjectSettings` now imports the config file through Bun's native TypeScript support and validates the account settings with the same schema as the Node path, so account-level commands work under Bun.
