---
slug: body-workaround-drops-query-params
title: --body workaround branch drops query params
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# The `--body` bypass dropped query parameters

## Historical symptom

The generated `--body` short circuit once forwarded only the request path and payload. Query flags that the normal path sent were silently lost. A prominent example was the Workers script-delete `force=true` query, although that command is now bodyless and uses a typed SDK request.

## Current status

**Fixed in the generic emitter.**

`packages/cli/generator/emit/handler/body-bypass.ts` now builds a query string with `QS_FROM_PARAMS_EXPR` whenever an operation has query parameters and appends it to the request URL. The same URL expression is used for single requests, batched array bodies, raw bodies, and raw-output responses.

The normal fallback emitter in `packages/cli/generator/emit/handler/sdk-call.ts` likewise keeps query values separate from assembled body data. Current passthrough requests go through `requestApi()` in `packages/cli/src/lib/auth.ts`, whose query serializer handles scalar and repeated values.

## Verification

`packages/cli/src/__tests__/commands/body-bypass-query-params.test.ts` provides active network-level regression coverage:

- `kv keys update --body value --expiration-ttl 60` sends the raw value and `?expiration_ttl=60`;
- its dry-run preview reports the same query and raw body; and
- bodyless `workers secrets delete --url-encoded` sends `?url_encoded=true` through the typed SDK path.

The old references to a `bodyBypassUrlExpr` block in the monolithic `generator.ts`, and to the former `workers scripts delete --body {}` command, no longer describe the current generator or command surface.

## Resolution

This remains a cf-only, method-independent emitter rule. No product overlay is needed.
