---
slug: sdk-swallows-fetch-errors
title: Transport failures were misreported as HTTP 500 API errors
status: Fixed
fix-location: both
last-verified: 2026-09-16
---

# Transport failures were misreported as API 500s

## Historical symptom

When `fetch` rejected before returning a `Response`—for example because of DNS, connection refusal, TLS, or an unhandled MSW request—the old SDK path could flatten the failure and later present it as though the API had returned HTTP 500. That made test and user diagnostics point at the wrong layer.

## Current status

Fixed by the current client architecture.

Typed generated SDK requests classify a rejected fetch as an `unknown` transport error in `packages/cli/src/sdk/sdk/core/fetcher/Fetcher.ts`, retaining both the original message and `cause`. `handleNonStatusCodeError.ts` converts it to `CloudflareApiError` without fabricating a status code and preserves the cause. Only a real non-OK `Response` enters the status-code branch.

For direct/raw requests, `packages/cli/src/lib/auth.ts` catches transport errors and throws a plain `Error("Request failed: ...")`; it creates `CloudflareApiError` only after receiving a non-OK response. Its unit test asserts that a rejected fetch with `socket closed` remains `Request failed: socket closed`.

## Residual distinction

The direct `requestApi()` wrapper does not currently attach the original error as `cause`, while the typed SDK does. Preserving that cause would improve stack inspection, but the original correctness problem—claiming a network failure was HTTP 500—is closed. Older AGENTS.md follow-up text describing the fake-500 behavior is therefore stale and should not be used as current architecture.
