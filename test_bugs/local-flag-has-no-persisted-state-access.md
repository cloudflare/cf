---
slug: local-flag-has-no-persisted-state-access
title: cf --local could not access persisted state without a running dev session
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# `cf --local` can access persisted state directly

## Historical symptom

The first local-mode design depended on an already-running development peer, so a script could not inspect persisted data by invoking cf alone.

## Current status

Fixed. `packages/cli/src/lib/local-runtime.ts` starts Miniflare on demand, dispatches the request through its local explorer, and disposes the runtime before exit. `--persist-to <dir>` selects a persistence root; without it cf uses its global Cloudflare state directory. Miniflare stores resources below the versioned `v3` child of that root.

For example, this does not require `cf dev` to be running:

```bash
cf kv keys list --namespace-id <id> --local --persist-to ./state
```

`packages/cli/src/__tests__/lib/local-e2e.test.ts` exercises real persisted KV reads and writes. Other local tests cover route rewriting, peer discovery, runtime lifecycle, and the supported KV/D1/R2 surfaces.

## Remaining limits

cf still does not read project Worker definitions. Direct KV, D1, and R2 requests derive the resource identifier from the API path. Durable Objects and Workflows require a live dev-registry peer advertising their bindings, and control-plane endpoints with no Miniflare explorer route have no local equivalent. These are architectural limits, not a regression of this fix.
