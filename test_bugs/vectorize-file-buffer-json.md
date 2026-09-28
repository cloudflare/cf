---
slug: vectorize-file-buffer-json
title: Vectorize file buffers were JSON-serialized
status: Fixed
fix-location: both
last-verified: 2026-09-16
---

# Vectorize file buffers were JSON-serialized

## Historical symptom

Vectorize insert/upsert read NDJSON into a Node `Buffer`, but the old request serializer did not classify typed-array views as raw bodies. It sent a JSON representation such as `{"type":"Buffer","data":[...]}` while claiming the content type was `application/x-ndjson`.

## Current status

Fixed. The current direct request path in `packages/cli/src/lib/auth.ts` classifies `ArrayBuffer.isView(body)` as raw, which includes Node `Buffer` and other typed arrays. Generated Vectorize insert/upsert file branches pass the `Buffer` returned by `readFileForFlag()` directly to `requestApi()` with the NDJSON content type.

The checked-in generated SDK's fetch path likewise supports binary request bodies. The original fix landed in the Forge SDK transformer; cf's later passthrough request helper preserves the same predicate.

Both raw-byte round-trip tests in `packages/wrangler-tests/src/__tests__/vectorize/vectorize.upsert.test.ts` are active. They assert the content type and the exact request text for insert and upsert.

## Resolution

This record is retained as a serialization regression guard. Any future request wrapper must recognize `ArrayBufferView`, not only `ArrayBuffer`, because Node file reads return `Buffer`.
