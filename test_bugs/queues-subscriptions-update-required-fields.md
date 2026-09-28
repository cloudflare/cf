---
slug: queues-subscriptions-update-required-fields
title: queues subscriptions update enforced create-only destination fields
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# Subscription PATCHes over-required destination fields

## Historical symptom

A partial `cf queues subscriptions update <id> --name ...` prompted for `--destination-queue-id` and `--destination-type`. Those leaves are required inside a destination object, but the destination object itself is optional on PATCH.

## Current status

Fixed by generic group-implies behavior. The current generated `packages/cli/src/commands/_generated/queues/subscriptions/update.ts` keeps both destination flags optional. Its `.check()` requires the pair only if at least one `--destination-*` flag is present. Unrelated partial updates omit the destination object entirely.

`packages/wrangler-tests/src/__tests__/queues/queues-subscription.test.ts` now uses per-field flags in active partial-update tests and asserts the PATCH body. The old Wrangler test requiring an error for an entirely empty update is skipped because cf permits an empty partial PATCH and lets the API decide.

## Resolution

The cf generator now respects required leaves below optional parents. Forge continues to report the schema's nested requirements; cf maps them to the flattened flag UX without turning them into unconditional yargs requirements.
