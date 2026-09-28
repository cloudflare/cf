---
slug: list-no-pagination
title: List commands return one API page
status: IntentionalDivergence
fix-location: both
last-verified: 2026-09-16
---

# List commands return one API page

## Current behavior

`cf <product> list` makes one API request and returns one page. It does not automatically follow cursor- or page-based pagination the way Wrangler often does. Callers must use the particular operation's exposed cursor/page flags.

This remains an intentional divergence, not an accidentally missing loop. It is documented in:

- `AGENTS.md`, “List pagination (intentional divergence)”.

The Page/envelope unwrapping performed by output formatting changes only the printed shape. It does not issue additional requests.

## Test evidence

`packages/wrangler-tests/src/__tests__/kv/namespace.test.ts` retains `it.todo("should make multiple requests for paginated results")`. The active KV namespace list test verifies only the first response. Generated list handlers likewise contain one client/request call.

## Reopening path

If this is revisited, the design remains a Forge method annotation such as `x-forge-list-pagination`, plus a generic cf paginator and an explicit `--all`-style opt-in. Pagination schemes and result envelopes differ across products, so a per-product loop in `packages/cli/src/` would violate the product-agnostic source invariant. Streaming or bounded output also needs to be considered for very large collections.
