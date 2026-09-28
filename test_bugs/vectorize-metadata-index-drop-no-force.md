---
slug: vectorize-metadata-index-drop-no-force
title: Vectorize metadata-index deletion lost --force during an annotation rename
status: Fixed
fix-location: both
last-verified: 2026-09-16
---

# Vectorize metadata-index deletion lost `--force`

## Historical symptom

The destructive operation is an API POST. When Forge renamed its non-DELETE confirmation annotation, cf still read the old property, so the command had neither an interactive guard nor a `--force` bypass. The leaf was also renamed from Wrangler's older “drop” terminology to `delete`.

## Current status

Fixed. The current surface is:

```text
cf vectorize metadata-index delete <index-name> \
  --property-name <property> [--force]
```

`packages/cli/src/commands/_generated/vectorize/metadata-index/delete.ts` contains `--force` / `-f`, passes the Forge confirmation string to `confirmDelete()`, and sends the destructive POST only after confirmation. Labels are now the generator's verb-only `Deleting` / `Deleted` strings.

`packages/wrangler-tests/src/__tests__/vectorize/vectorize.test.ts` has an active delete-metadata-index case using `--force` and asserting the response.

## Resolution

Forge supplies `x-forge-require-confirmation`; cf's generic destructive-op emitter consumes it. This shares the same fixed path as Queues purge and does not add Vectorize-specific behavior to `packages/cli/src/`.
