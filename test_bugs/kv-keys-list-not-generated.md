---
slug: kv-keys-list-not-generated
title: `kv keys list` was missing from the generated command tree
status: Fixed
fix-location: forge-only
last-verified: 2026-09-16
---

# `kv keys list` was missing from the generated command tree

## Historical symptom

The KV list-keys endpoint existed in the OpenAPI source, but the forge KV overlay did not place it in the `keys` command group. No leaf was emitted, so `cf kv keys list --namespace-id <id>` was rejected by yargs.

## Current status

Fixed. The overlay now exposes the list method and `packages/cli/src/commands/_generated/kv/keys/list.ts` is generated with:

- required `--namespace-id`;
- optional `--limit`, `--prefix`, and `--cursor` query flags;
- dry-run URL/query rendering; and
- a typed `client.kv.keys.list(...)` request.

The active Wrangler-ported namespace-ID test asserts that returned key items are printed. Binding-name cases remain skipped because cf deliberately does not read Worker bindings from source configuration.

Automatic pagination is not part of this fix. The command returns the requested API page, accepts an explicit cursor, and the multiple-request pagination test remains `it.todo` under `list-no-pagination.md`. Latest fetched Wrangler source contains both the namespace-ID behavior and its own pagination coverage, which was used as the reference.

cf now also has a global `--local` routing path for supported generated operations, including KV; the old statement that there was no local/remote split is obsolete. That support is independent of why this command was once absent.

## Fix location

Forge-only. The API operation already existed; adding it to the KV overlay's command grouping was sufficient for cf to generate the leaf and metadata.
