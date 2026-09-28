---
slug: kv-keys-get-raw-bytes-regressed
title: `kv keys get` raw-byte output regressed after response metadata changed
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# `kv keys get` raw-byte output regressed

## Historical symptom

After forge replaced a flat response-content-type field with a per-status response map, cf's output classifier fell back to JSON. `kv keys get` therefore lost its byte-stream path and `--text` option and attempted to format the value as ordinary JSON.

## Current status

Fixed. Response classification now lives in `packages/cli/generator/codegen/output-kind.ts`, with the current type:

```ts
type OutputKind = "json" | "binary" | "text" | "websocket";
```

`deriveOutputKind()` starts with the first declared 200, 201, 202, or 204 response. If a `2XX` response is present, the current implementation warns and uses it instead, even when it already selected an exact response, then classifies the selected media types. It recognizes octet-stream, zip, PDF, pcap, multipart, and image responses as binary; `text/plain`, `text/csv`, `text/html`, and `text/vtt` as text; and JSON media types including `+json` suffixes as JSON. A sole 101 response is surfaced as websocket rather than silently treated as JSON.

Current generated `kv/keys/get.ts`:

- exposes `--text`;
- calls `fetchRawBytes()` with local/persistence options;
- writes the Buffer directly by default; and
- decodes it as UTF-8 only when `--text` is set.

All four formerly-todo KV get cases are active: text value as bytes, text decoding, lossy binary-to-text decoding, and binary output. A fifth active test checks encoded special-character keys. Latest fetched Wrangler KV tests were checked for the same output contract.

## Fix location

cf-only. Forge's response map is the authoritative metadata and the refactor was intentional; cf needed to consume that shape correctly. The old `raw-bytes`/`raw-text` names, monolithic generator path, and "tests can now be wired up" language no longer describe the repository.
