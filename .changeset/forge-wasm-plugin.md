---
"cf": minor
---

Generate commands with the new Forge and its WebAssembly plugin

cf's command generator is now a Forge plugin that the native Forge binary runs.
The command tree it produces differs from before in a few ways.

**Breaking:** commands whose names came from camelCase or snake_case spec names
are now kebab-case, like the rest of cf. For example:

- `cf accounts billing getCredits` → `cf accounts billing get-credits`
- `cf addressing regional_hostnames list` → `cf addressing regional-hostnames list`
- `cf analytics_engine sql query` → `cf analytics-engine sql query`
- `cf csamScanner get` → `cf csam-scanner get`
- `cf fieldExtractors get` → `cf field-extractors get`
- `cf dls regional_services prefix_bindings list` → `cf dls regional-services prefix-bindings list`

This affects 42 commands across `accounts billing`, `accounts subscriptions`,
`addressing regional-hostnames`, `analytics-engine`, `billing profiles`,
`cloudforce-one`, `csam-scanner`, `dls regional-services`, `field-extractors`,
`managed-defense` and `user memberships`.

**Breaking:** `--notification-email` is no longer a flag on
`cf load-balancers pools bulk-edit` or `cf user load-balancers pools edit pools pools`;
pass it with `--body`.

Commands also gain body flags they previously could only receive through
`--body`, for example `--allow-resource-types` and `--reject-resource-types` on
`cf browser-run quick-action`, the address and content flags on
`cf email-sending send`, and `--status` on `cf user memberships update` and
`cf user invites respond`. A few flags gain enum choices, and
`cf tunnels create --config-source` no longer defaults to `local`.
