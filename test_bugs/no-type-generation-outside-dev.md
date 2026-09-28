---
slug: no-type-generation-outside-dev
title: cloudflare.config.ts has no standalone CLI type-generation workflow
status: Active
fix-location: both
last-verified: 2026-09-16
---

# No standalone type generation for `cloudflare.config.ts`

## Current status

Active, with a narrower description than the original report.

- `@cloudflare/vite-plugin` 1.54.9 writes `worker-configuration.d.ts` only when Vite's command is `serve`; the gate is in `packages/vite-plugin-cloudflare/src/plugin-config.ts`.
- Wrangler's automatic new-config generation runs from the dev `ConfigController`.
- `cf build` and `cf deploy` do not generate the file.
- Wrangler's `types` command remains centered on Wrangler configuration and is not one of the five command families accepting `--experimental-new-config`.

There is therefore still no direct `cf types` or `wrangler types --experimental-new-config` command suitable for a fresh CI checkout before typechecking.

## What has improved

`@cloudflare/config` is now a published package (0.12.0 in both cf and the current Workers SDK checkout) and exports `generateTypes()` from its public root. A project can write its own small script to generate config-derived types, so the old assertion that generation is possible only inside dev is no longer literally true. The missing piece is a supported CLI workflow that loads/validates the config, selects mode and runtime type options, writes/checks the output, and gives it a stable contract.

## Current workarounds

Projects can commit the generated declaration, run Vite dev once before typechecking, or call `@cloudflare/config` programmatically. Committing the file remains reasonable when runtime globals are provided separately and `includeRuntime` is disabled, but it requires an explicit process for keeping the file current.

## Resolution direction

A standalone command should share `@cloudflare/config`'s generator and the same mode/include-runtime semantics as the Vite and Wrangler dev paths. cf would need to decide whether this belongs in its own command surface or in a delegate; Wrangler could alternatively extend `wrangler types` to the new config.
