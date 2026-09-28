---
slug: queues-create-missing-settings-flags
title: queues create lacks --settings-* per-field flags
status: Active
fix-location: upstream-spec
last-verified: 2026-09-16
---

# `queues create` lacks settings flags

## Current status

Active. The generated `packages/cli/src/commands/_generated/queues/create.ts` exposes `--queue-name` and the raw `--body` escape hatch, but no flags for:

- `settings.delivery_delay`;
- `settings.delivery_paused`; or
- `settings.message_retention_period`.

The update/edit schemas do expose the corresponding `--settings-delivery-*` and `--settings-message-retention-period` flags. Users can still create a configured queue with a complete JSON body.

## Test evidence

In `packages/wrangler-tests/src/__tests__/queues/queues.test.ts`, the basic create test is active, while the create-with-delivery-delay and create-with-retention-period cases remain `it.todo`. Their comments point to this record. Wrangler-only duplicate-value and bespoke range-validation tests remain skipped for separate reasons.

## Cause and resolution direction

The generated surface reflects the create operation's current schema: Forge does not receive those nested create properties as body parameters. The preferred fix is to make the canonical create request schema describe the settings accepted by the API, then re-vendor and regenerate. A cf-only list of Queues fields would violate the product-agnostic generator design.
