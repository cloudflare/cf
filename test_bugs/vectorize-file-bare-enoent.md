---
slug: vectorize-file-bare-enoent
title: "vectorize {insert,upsert} --file exposed bare ENOENT"
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# Vectorize file input exposed raw filesystem errors

## Historical symptom

`cf vectorize upsert <index> --file missing.ndjson` used a bare `readFileSync`, leaking an absolute working-directory path and Node's ENOENT stack instead of a useful CLI error.

## Current status

Fixed by `readFileForFlag()` in `packages/cli/src/lib/input-validation.ts`. It resolves and reads the path, catches filesystem failures, and throws:

```text
Cannot read invalid or empty file: <user-supplied-path>
```

The generator's raw file and multipart emitters both call this helper: `packages/cli/generator/emit/handler/file-upload.ts` and `multipart.ts`. The behavior therefore applies across generated `--file` commands, not only Vectorize.

`packages/wrangler-tests/src/__tests__/vectorize/vectorize.upsert.test.ts` contains an active missing-file regression test with the exact friendly error.

## Resolution

This was cf-only local input handling. Forge correctly described a file upload; the CLI owns reading the user's filesystem and rendering failures.
