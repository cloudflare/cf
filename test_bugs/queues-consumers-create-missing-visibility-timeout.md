---
slug: queues-consumers-create-missing-visibility-timeout
title: queues consumers create lacked --settings-visibility-timeout-ms
status: Fixed
fix-location: forge-only
last-verified: 2026-09-16
---

# Queues HTTP-pull consumers lacked visibility timeout

## Historical symptom

The Queues consumer request is a `oneOf`: Worker consumers and HTTP-pull consumers share a nested `settings` object but expose different leaves. Forge kept the first `settings` schema instead of merging the object properties, so `visibility_timeout_ms` disappeared from the generated CLI.

## Current status

Fixed. Forge now deep-merges object properties found across `oneOf` variants and intersects their required sets. The current generated `packages/cli/src/commands/_generated/queues/consumers/create.ts`:

- exposes `--settings-visibility-timeout-ms`;
- places it in the HTTP-pull variant's conflicts table; and
- writes it to `settings.visibility_timeout_ms` in dry-run and live bodies.

`packages/wrangler-tests/src/__tests__/queues/queues.test.ts` has an active HTTP-pull consumer test that supplies the flag and asserts the request.

## Resolution

This was a Forge resolver fix, not Queues-specific cf logic. The generic object merge also preserves fields from any other discriminator variants that reuse a nested object name.
