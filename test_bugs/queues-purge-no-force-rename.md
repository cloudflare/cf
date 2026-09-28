---
slug: queues-purge-no-force-rename
title: queues purge lost --force during the confirmation annotation rename
status: Fixed
fix-location: both
last-verified: 2026-09-16
---

# Queues purge lost its confirmation bypass

## Historical symptom

Queues purge is a destructive POST rather than DELETE. During Forge's rename from the old boolean delete-confirmation marker to the string-valued `x-forge-require-confirmation`, cf still read the old property. The generated command therefore rejected `--force` and did not prompt before purging.

## Current status

Fixed. `packages/cli/generator/emit/build-context.ts` treats an operation with a string `method.requireConfirmation` as destructive, and `emit/handler/delete-confirm.ts` emits `confirmDelete()` with that message. `packages/cli/generator/emit/builder.ts` emits `--force` / `-f` for the same operations.

The current `packages/cli/src/commands/_generated/queues/purge/start.ts` contains both the flag and confirmation call. The Wrangler-port queue tests actively cover missing and accepted `--force` in non-interactive mode, `--force` in interactive mode, and an accepted interactive confirmation. The inherited typed-name rejection case remains skipped because cf uses a boolean confirm prompt rather than Wrangler's typed queue-name confirmation.

## Resolution

Forge supplies the annotation and cf consumes it generically. The same path also protects destructive non-DELETE operations such as Vectorize metadata index deletion; no Queues-specific source behavior was added.
