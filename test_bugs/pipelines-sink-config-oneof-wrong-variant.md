---
slug: pipelines-sink-config-oneof-wrong-variant
title: "pipelines sinks create: config group-implies used the wrong oneOf variant"
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# Pipelines sink config validation used the wrong `oneOf` variant

## Historical symptom

`pipelines sinks create` has a discriminated config object. An R2 sink needs credential fields, while an `r2_data_catalog` sink needs namespace, table, and token fields. The first group-implies implementation derived one required set from the first variant, then applied it to every config flag. Catalog flags therefore demanded incompatible R2 credential flags and could not be used without `--body`.

## Current status

Fixed. The current generated `packages/cli/src/commands/_generated/pipelines/sinks/create.ts` emits variant-aware conflict and shared-field required checks. Selecting `--type r2_data_catalog` permits catalog flags without requiring the R2 credentials; `--config-table-name` and `--config-token` require each other, but the command does not require the complete catalog field set.

`packages/wrangler-tests/src/__tests__/pipelines.test.ts` now exercises the R2 Data Catalog sink through per-field flags rather than the historical `--body` escape hatch and asserts the assembled request body.

## Resolution

The fix is generic cf generator behavior for flattened `oneOf` fields. It uses the discriminator/variant constraint metadata already supplied by Forge, so no Pipelines-specific branch was added to `packages/cli/src/`. This record supersedes its old contradictory “Current status: Active” section.
