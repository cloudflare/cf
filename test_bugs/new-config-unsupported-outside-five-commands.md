---
slug: new-config-unsupported-outside-five-commands
title: Wrangler new-config support remains limited to five command families
status: Active
fix-location: wrangler
last-verified: 2026-09-16
---

# Wrangler new-config support stops at five command families

## Current status

Active in Wrangler 4.131.2. At workers-sdk commit `40dd545c359acad5c987b3a16ab6d65dfd86a81b`, imports of `experimentalNewConfigArg` exist only in:

- `dev`;
- `build`;
- `deploy`;
- `versions deploy`; and
- `versions upload`.

Other Wrangler commands that load project configuration still use legacy Wrangler configuration and cannot opt into `cloudflare.config.ts`.

## Practical consequences

`wrangler secret put` still cannot infer a Worker name from the new config. The target cf schema classifies Worker secret writes as SDK-only, so cf has no direct CLI equivalent. Automation using the SDK must therefore supply and validate the Worker identifier itself.

The older claim that cf has no D1 migration command is no longer true. cf now ships the hand-written, Wrangler-compatible subgroup:

```text
cf d1 migrations create <message>
cf d1 migrations list <database>
cf d1 migrations apply <database>
```

It has dedicated command, bookkeeping, local-mode, and drift tests under `packages/cli/src/__tests__/commands/migrations/`. It does not read the new config for a database binding or migration directory: the database ID and file options are explicit. Wrangler's own `d1 migrations` family still lacks `--experimental-new-config`.

## Resolution direction

This record is now a Wrangler coverage gap rather than a claim that every workflow is blocked. Wrangler can either extend the shared experimental flag and `readNewConfig` conversion to each config-consuming family, or users can adopt explicit cf commands where equivalent API/workflow coverage exists. Per-command semantics still need review; blindly registering the flag would not make legacy binding/name inference correct.
