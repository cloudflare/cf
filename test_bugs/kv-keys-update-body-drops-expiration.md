---
slug: kv-keys-update-body-drops-expiration
title: "KV raw --body dropped expiration query parameters"
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# KV raw `--body` dropped expiration query parameters

## Historical symptom

`cf kv keys update <key> --namespace-id <id> --body <value> --expiration-ttl 60` used to send the value without the `expiration_ttl=60` query parameter. The raw-body escape hatch constructed its own URL and did not reuse the operation's query bag.

## Current status

Fixed for the raw `--body` path. The generated `packages/cli/src/commands/_generated/kv/keys/update.ts` now builds a `URLSearchParams` value from `queryParams` and appends it to the request URL. The generic implementation lives in `packages/cli/generator/emit/handler/body-bypass.ts`.

First-class network coverage is in `packages/cli/src/__tests__/commands/body-bypass-query-params.test.ts`. It asserts both that the PUT body is unchanged and that `expiration_ttl` reaches the request URL. The older Wrangler-port test in `packages/wrangler-tests/src/__tests__/kv/key.test.ts` is also active.

## Remaining related gap

The sibling `--file` and multipart `--metadata` branches in the current generated KV command still call `requestApi()` without `query: queryParams` or an appended query string. Therefore this historical record is closed, but the same endpoint can still drop `--expiration` / `--expiration-ttl` when used with `--file` or `--metadata`. That should be fixed generically in `emit/handler/file-upload.ts` and `emit/handler/multipart.ts`, not with a KV-specific branch.

## Resolution

The fix is cf-generator-only. Forge already supplied the query parameters; the CLI emitter was responsible for carrying them through its alternate raw-body request path.
