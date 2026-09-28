---
slug: kv-bulk-delete-not-destructive
title: `kv bulk delete` was not annotated as destructive
status: Fixed
fix-location: forge-only
last-verified: 2026-09-16
---

# `kv bulk delete` was not annotated as destructive

## Historical symptom

Bulk KV deletion is a POST operation. Before it had explicit product metadata, the generic HTTP DELETE rule did not add a confirmation prompt or `--force`, so scripts could delete many keys without the CLI's standard destructive-operation guard.

## Current status

Fixed in the KV forge overlay. The operation now carries:

```text
x-forge-require-confirmation:
  This operation deletes the specified keys from the namespace.
```

Current generated `kv/bulk/delete.ts` exposes `--force/-f`, calls `confirmDelete({ force, message })`, aborts before making a request on decline, and uses destructive progress labels. The same generated handler batches arrays above the schema's 10,000-item maximum, with one confirmation before the batch loop.

Test coverage is only partly aligned with the implementation:

- active string-array and `{ name }` object-array deletion tests accept the confirmation and assert the request body;
- the decline and `--force`/`-f` bypass cases remain `it.todo`; and
- the batching test also remains `it.todo` under a stale 5,000-item title.

The nearby test comment claiming the generated command has neither a prompt nor a force flag is itself stale. Latest fetched Wrangler source was checked as the behavioral reference and retains its destructive bulk-delete flow.

## Fix location

Forge-only for this bug. cf already understands `x-forge-require-confirmation`; the product overlay needed to classify a destructive POST. Body forwarding and batching are tracked separately in `kv-bulk-update-delete-body-dropped.md`.
