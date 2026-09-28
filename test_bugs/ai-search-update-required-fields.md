---
slug: ai-search-update-required-fields
title: ai-search update enforces create-only required fields
status: Fixed
fix-location: both
last-verified: 2026-09-16
---

# `ai-search update` enforced create-only required fields

## Historical symptom

Partial updates such as `cf ai-search update <id> --cache` used to run create-time required-field guards. Callers were prompted for unrelated index and metadata fields and had to use `--body` to bypass the generated per-field path.

## Current status

**Fixed.** The current command is generated at `packages/cli/src/commands/_generated/ai-search/update.ts` (the old `ai-search/namespaces/instances/update.ts` path no longer exists).

The builder now:

- requires the instance `<id>` and namespace `--name`;
- leaves genuine update fields optional individually; and
- enforces only the real paired constraint on `--index-method-keyword`/`--index-method-vector`: if either is supplied, both are required.

The handler accepts `--body` before per-field assembly. Otherwise it builds a compact request body, so omitted flags are not fabricated onto the wire.

## Verification

`packages/wrangler-tests/src/__tests__/ai-search.test.ts` now has active tests for both a multi-flag partial update and a two-field update. The latter asserts the exact request body is only `{ cache: true, score_threshold: 0.75 }`.

The custom-namespace update and Wrangler-derived “no fields provided” cases remain `it.todo`; they are coverage gaps, not evidence that the original required-field bug remains. In particular, the old record's references to a `source_params` storage-id guard and a second generated update module no longer match the current schema or generated tree.

## Resolution

The fix remains split across both layers: Forge supplies corrected update requiredness/constraints, and cf's generic optional-parent and compact-body logic preserves them in the flat CLI surface.
