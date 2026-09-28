---
slug: config-loader-unsupported-on-bun
title: cloudflare.config.ts cannot be loaded under Bun
status: IntentionalDivergence
fix-location: config-pkg
last-verified: 2026-09-22
---

# `cloudflare.config.ts` cannot be loaded under Bun

## Symptom

The config loader rejects Bun with:

> cloudflare.config.ts loading is not supported on Bun. Please use Node.js v22.18.0 or higher.

It relies on Node's synchronous `module.registerHooks` API to resolve `with { type: "cf-worker" }` imports, cache-bust config graphs, and collect dependencies for reloads.

## Current status

**Intentional divergence.** cf's pinned `@cloudflare/config@0.17.0` still performs the explicit `process.versions.bun` check and still requires `module.registerHooks`. The error is early and actionable; there is no fallback loader.

This does not prevent using Bun as package manager or task runner when the invoked cf/Vite/Wrangler executable has a Node shebang. It does mean a process actually running under Bun cannot import/load `cloudflare.config.ts`, and CI must have Node 22.18 or newer on PATH.

## Wrangler source check

Wrangler and the Vite plugin both call this same config package. The fetched Wrangler history also states that Wrangler does not officially support Bun; there is no Wrangler-side alternate config loader.

## Guidance

Put values shared with Bun scripts in an ordinary sidecar TypeScript module. The config can import that module, while Bun-side scripts import it directly instead of importing `cloudflare.config.ts`.

A future Bun implementation of compatible module hooks, or a separate hooks-free loader, could reopen this decision. No code change is currently planned.
