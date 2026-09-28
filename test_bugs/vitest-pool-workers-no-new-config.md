---
slug: vitest-pool-workers-no-new-config
title: Vitest supports cloudflare.config.ts; Wrangler createTestHarness does not
status: Active
fix-location: wrangler
last-verified: 2026-09-16
---

# New-config support is partial across test harnesses

## What is fixed

The original claim that no Workers test harness can load `cloudflare.config.ts` is obsolete. The package formerly named `@cloudflare/vitest-pool-workers` was renamed to `@cloudflare/vitest-plugin` for v1. Current version 1.1.9 supports:

```ts
cloudflareTest({ experimental: { newConfig: true } });
```

It can also accept `{ configPath }`, calls config functions with Vite's mode (normally `test`), rejects simultaneous legacy `wrangler` options, validates through `@cloudflare/config`, and converts the result for Miniflare. The implementation is in `packages/vitest-plugin/src/pool/new-config.ts` and `pool/config.ts`; the feature is recorded in the package changelog under workers-sdk PR #15272.

`@cloudflare/config` is also now publicly published (0.12.0 in both cf and the current Workers SDK checkout), so the old claim that conversion requires an internal registry is no longer true.

## What remains active

Wrangler 4.131.2's `createTestHarness()` still defines `WorkerInput` as either a legacy `{ configPath, ... }` input read by `readConfig()` or an inline Wrangler-shaped `{ config, ... }` input. It has no new-config discriminator or mode option. `unstable_dev()` likewise hard-codes `experimentalNewConfig: false` in its API adapter.

Projects using the current Vitest integration can remove their duplicated binding mapping by migrating to `@cloudflare/vitest-plugin`. Projects using Wrangler's standalone test harness still need a legacy config or inline conversion.

## Resolution direction

The remaining work is Wrangler-side: extend the harness input type with an explicit `cloudflare.config.ts` variant, mode selection, and validation via the now-public config package. This record remains Active for that narrower gap rather than claiming the already-shipped Vitest support is missing.
