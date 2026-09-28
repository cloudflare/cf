---
slug: d1-migrations-no-new-config-path
title: D1 migrations had no cf command or cloudflare.config.ts-compatible path
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# D1 migrations had no cf-native command

## Historical symptom

A project using cf and `cloudflare.config.ts` still needed a residual Wrangler config to run `wrangler d1 migrations`. The generated D1 API commands could execute SQL, but no cf command owned migration-file discovery, ordering, bookkeeping, creation, or application.

## Current status

**Fixed.** cf now has a hand-written subgroup at `packages/cli/src/commands/d1/migrations/`, spliced into the generated D1 index through `generator/hand-written-overrides.ts`:

- `cf d1 migrations create <message> [--dir] [--pattern]`
- `cf d1 migrations list <database> [--dir] [--pattern] [--table]`
- `cf d1 migrations apply <database> [--dir] [--pattern] [--table]`

The database argument must be either a UUIDv4 or a 32-hex-character Cloudflare ID; names and binding names are deliberately not resolved. File/tooling settings are CLI flags, so these commands do not need to read a Worker definition or a residual Wrangler config.

`list` and `apply` support remote execution and cf's `--local` routing. `create` is filesystem-only and rejects `--local` as unnecessary.

## Compatibility with Wrangler

The implementation ports the externally visible Wrangler contract:

- default `./migrations` directory and `d1_migrations` table;
- migration names recorded relative to the migrations directory;
- numeric path-component ordering before lexical fallback;
- configurable nested glob patterns, including Drizzle layouts;
- quoted table identifiers and escaped recorded names; and
- migration SQL plus its bookkeeping insert in one request.

`executeSql()` also applies Wrangler's structural CRLF normalisation before calling D1. Local mode uses D1 `raw` and converts rows/columns into the query result shape used by the shared bookkeeping code.

## Verification

First-class tests live under `packages/cli/src/__tests__/commands/migrations/` for apply, list, create, bookkeeping, and generator/metadata drift. The imported Wrangler corpus also contains active D1 migration helper and command coverage under `packages/wrangler-tests/src/__tests__/d1/`.

## Remaining caveat

As in Wrangler, the migration text and bookkeeping insert are sent together. Whether D1's remote multi-statement execution is truly atomic remains a server-side question; cf intentionally matches Wrangler so switching tools does not change the live bookkeeping contract.
