---
slug: generator-raw-path-no-url-encode
title: Generator raw-URL paths did not percent-encode path parameters
status: Active
fix-location: cf-only
last-verified: 2026-09-16
---

# Generator raw-URL paths did not percent-encode path parameters

## Historical symptom

Generated handlers sometimes bypass the typed SDK method: raw responses use `fetchRawBytes`, and operations requiring passthrough behavior use `requestApi`. Those paths interpolated CLI path parameters directly into a URL. A key such as `/my-key` therefore changed URL structure instead of being sent as the single `%2Fmy-key` segment that the user supplied.

Typed SDK calls were not affected because their URL builder already encoded path parameters.

## Current status

Partially fixed. For ordinary operation path parameters, `packages/cli/generator/emit/build-context.ts` constructs generator-owned request paths with `encodeURIComponent(String(argv[...]))` around supplied values. `generator/emit/handler/dry-run.ts` mirrors that encoding for real dry-run values while retaining readable `<name>` placeholders for missing values. Account, zone, and Worker context substitutions remain bare; the demonstrated unresolved case is Worker names, which are user-controlled strings passed through `getWorkerName()` unchanged and are not URL-safe by construction.

The special Worker-name substitution remains bare in generated dry-run previews. For example, `cf workers deployments create --dry-run --worker the/name` displays the slash as URL structure rather than encoding the Worker name as one segment. The remaining target-schema Worker commands use typed SDK paths when live, but the preview `scriptNameExpr` must be encoded before this record can return to Fixed; the live raw-path expression should be hardened at the same time for future operations.

For ordinary path parameters, this covers all generator-owned URL consumers, including body bypass, passthrough requests, query-bearing raw URLs, and binary/text response paths. It encodes each value separately rather than encoding the whole URL.

Current generated KV key get and update handlers encode both the namespace and key segments. Active tests in `packages/wrangler-tests/src/__tests__/kv/key.test.ts` exercise special-character keys on put/update, get, and delete paths; the raw-byte get case proves the `fetchRawBytes` branch is protected.

The latest Wrangler tests continue to provide the expected encoded-path behavior for ordinary path values, but the implementation and remaining Worker-name fix are in cf's generator because these raw request paths are cf-owned. The previous document's `client.<verb>` terminology, monolithic generator line numbers, and stray tool markup were stale.
