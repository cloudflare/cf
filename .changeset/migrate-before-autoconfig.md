---
"cf": minor
---

Offer to migrate Wrangler projects before running autoconfig

When `cf dev`, `cf build`, or the build phase of `cf deploy` finds a Wrangler
JSON, JSONC, or TOML configuration in a project that is not yet configured for
cf, it now offers to run the existing `cf migrate` flow. Accepting the prompt
migrates the project and continues the requested command; declining preserves
the existing autoconfig behavior. Non-interactive runs do not migrate
automatically.
