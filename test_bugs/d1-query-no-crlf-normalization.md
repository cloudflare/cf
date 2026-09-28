---
slug: d1-query-no-crlf-normalization
title: cf d1 query/raw send SQL without Wrangler's structural CRLF normalisation
status: Active
fix-location: external, forge-only
last-verified: 2026-09-16
---

# Generated D1 query commands do not normalise structural CRLF

## Symptom

The D1 query service has historically mishandled CRLF line endings while splitting compound multi-statement SQL. Wrangler protects its inline-command path with a scanner that converts structural `\r\n` to `\n` without changing quoted values or identifiers. It also normalises CRLF inside line and block comments.

The generated cf commands still send `--sql` text as read:

- `packages/cli/src/commands/_generated/d1/query.ts`
- `packages/cli/src/commands/_generated/d1/raw.ts`

Both call `resolveFileToken(..., "text")` and place the returned string in the typed request body. Their `--body` bypass also performs no SQL-specific normalisation.

## Current status

**Active for `d1 query` and `d1 raw`.** The previous record predated cf's migration command, so one important qualification is now required: `cf d1 migrations apply` **is protected**.

`packages/cli/src/commands/d1/migrations/bookkeeping.ts` contains a port of `normalizeSqlLineEndings()`, with tests for quoted strings/identifiers, comments, escapes, and structural newlines. `commands/d1/migrations/shared.ts::executeSql()` calls it for every remote or local migration query.

No equivalent transform is applied by the generated query/raw handlers.

## Wrangler source check

Latest fetched Wrangler source still imports `normalizeSqlLineEndings` from `packages/wrangler/src/d1/splitter.ts` and applies it to `input.command` before posting to D1. Wrangler's file-import path is different—it uploads through the import workflow—whereas cf's `--sql @file.sql` reads a file and then uses the inline query endpoint.

## Fix location

The preferred fix remains the D1 service. Otherwise the workaround belongs in the D1 SDK/Forge description so both generated operations and other clients get it. Putting a D1-only scanner in a generic cf library would violate the product-agnostic source invariant.

## Workaround

Normalise SQL files to LF before invoking `cf d1 query` or `cf d1 raw`. Using `--body` does not avoid the issue.
