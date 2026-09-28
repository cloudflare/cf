---
slug: delete-no-body-requires-body
title: DELETE commands with empty-body schemas required `--body`
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# DELETE commands with empty-body schemas required `--body`

## Historical symptom

Some DELETE operations have an OpenAPI `requestBody` placeholder but no actual payload. The generator treated every such operation as body-bearing and emitted a guard requiring `--body`, so commands such as `kv namespaces delete`, `mtls-certificates delete`, and the then-generated `workers scripts delete` needed the meaningless workaround `--body {}`.

## Current status

Fixed. Empty-body classification now lives in `packages/cli/generator/arg-derivation.ts` as `hasEmptyBody`, rather than in the old monolithic `generator.ts`.

An operation is collapsed to bodyless only when all of these conditions hold:

- the operation is marked as having a request body;
- `requestBodyRef` is `null`;
- there are no flattened body parameters;
- the request is neither multipart nor array-bodied; and
- its request content types are absent or JSON-only.

The referenced-schema and array checks are important: a schema can have no flattenable flags while still requiring a real payload. The required-body guard in `generator/emit/handler/sdk-call.ts` is emitted only when `hasBody` is true and `hasEmptyBody` is false.

Current generated handlers for KV namespace deletion and mTLS certificate deletion have `bodyKind: "none"`, expose no body requirement, and make a typed SDK request without a body. The replacement `cf workers delete` operation is also bodyless. Active Wrangler-ported tests invoke all three without the old workaround. The previously documented `organizations/members/delete.ts` straggler no longer exists.

## Fix location

cf-only. Forge correctly reports that the OpenAPI operation contains a `requestBody` node; cf owns the conservative interpretation needed to distinguish an empty placeholder from a real CLI payload.
