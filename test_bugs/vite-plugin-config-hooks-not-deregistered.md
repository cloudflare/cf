---
slug: vite-plugin-config-hooks-not-deregistered
title: Config loader hooks remain installed after loading cloudflare.config.ts
status: Active
fix-location: config-pkg
last-verified: 2026-09-22
---

# Config-loader Node hooks remain process-wide

## Historical reproduction

With `@cloudflare/vite-plugin` new config enabled, a TanStack Start build failed while loading CSS because Cloudflare's process-wide Node `load` hook was still in the chain. The downstream loader returned a null source for a CSS URL, and Node reported that the hook returned an invalid value. Switching back to Wrangler JSON configuration avoided installing the hook and made the same build pass.

## Current source status

Still active in cf's pinned `@cloudflare/config@0.17.0` and in the current Workers SDK source:

- `packages/config/src/load.ts` calls `registerConfigHooks()` at the start of every `loadConfig()`;
- registration is process-global and cached in a module-level `deregister`;
- the returned deregistration callback exists, but `loadConfig()` never calls it; and
- the `load` hook forwards every non-`cf-worker:` URL through `nextLoad()` after import-attribute cleanup.

The implementation has improved since the original report: registration is idempotent, deregistration resets the cache, resolution only cache-busts the config dependency graph, and unsupported Node versions fail lazily. None of those changes scopes the hook lifetime.

## Fix location and direction

The shared fix site is now `@cloudflare/config`, not just the Vite plugin; Wrangler also consumes this loader. A robust fix should make unrelated URLs a strict pass-through and define hook lifetime explicitly. Simply deregistering after one import needs concurrency/reference-counting consideration, while watch mode may intentionally require future reloads. A regression fixture should load new config and then exercise an unrelated Vite/framework module load in the same process.
