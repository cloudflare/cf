---
slug: vectorize-query-missing-flags
title: vectorize query is missing --vector-id, --namespace, and --filter
status: Active
fix-location: upstream-spec, forge
last-verified: 2026-09-16
---

# `vectorize query` is missing query-body flags

## Current status

Active. `packages/cli/src/commands/_generated/vectorize/query.ts` currently exposes:

- `--vector`;
- `--top-k`;
- `--return-values`;
- `--return-metadata`; and
- the raw JSON `--body` escape hatch.

It does not expose `--vector-id`, `--namespace`, or `--filter`. The per-field path requires `--vector`; callers needing those other request forms must pass the complete request through `--body`.

The corresponding vector-id/options/filter integration cases and the vector-versus-vector-id exclusivity cases remain `it.todo` in `packages/wrangler-tests/src/__tests__/vectorize/vectorize.test.ts`.

## Cause

The query schema consumed by Forge does not supply `vectorId` or `namespace` as ordinary request-body fields. `filter` is an open-ended object expression; Forge's scalar-leaf flattening cannot turn a property with arbitrary keys into normal nested flags and currently drops it from the per-field surface.

The generated handler's `--body` branch is typed and can carry the wider JSON accepted by the service at runtime, but it does not provide CLI validation or discoverability for those fields.

## Resolution direction

The canonical API schema should describe `vectorId`, `namespace`, and the vector/vectorId exclusivity. Forge also needs a generic representation for a terminal free-form object, which cf can expose as a JSON-valued flag. A Vectorize-only parser in `packages/cli/src/` would violate the product-agnostic invariant.
