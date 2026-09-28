---
slug: vectorize-file-empty-no-check
title: "vectorize {insert,upsert} --file accepted an empty file"
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# Vectorize file input accepted zero-byte files

## Historical symptom

Generated file-upload branches sent an empty body to the API, which then returned an opaque server error. Wrangler rejected empty Vectorize NDJSON before making a request.

## Current status

Fixed in the same generic helper as missing-file handling. `packages/cli/src/lib/input-validation.ts` checks `bytes.byteLength === 0` inside `readFileForFlag()` and throws `Cannot read invalid or empty file: <path>`.

Both `file-upload.ts` and `multipart.ts` emit calls to the helper, so the guard applies to every generated `--file` branch. The active empty-file test in `packages/wrangler-tests/src/__tests__/vectorize/vectorize.upsert.test.ts` asserts that the request is rejected locally.

## Resolution scope

The check is intentionally generic. If an API ever has a meaningful zero-length file operation, it will need an explicit opt-out rather than silently weakening validation for all current upload commands.
