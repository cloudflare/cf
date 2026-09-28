---
slug: sdk-no-url-encode-path-params
title: Generated clients did not URL-encode path parameters
status: Active
fix-location: cf-only
last-verified: 2026-09-16
---

# Generated requests did not encode path parameters

## Historical symptom

A secret named `the/key` was interpolated as two URL segments instead of the single segment `the%2Fkey`. The same bug affected reserved characters in every ordinary opaque path parameter.

## Current status

Partially fixed. The checked-in generated SDK uses `packages/cli/src/sdk/sdk/core/url/encodePathParam.ts` for typed resource-client paths, and cf's direct/passthrough URL emitters wrap ordinary generated argv path values with `encodeURIComponent(String(...))`.

Resolved Worker-name substitutions remain bare in generated Worker dry-run URLs. For example, a dry run of `cf workers deployments create --worker the/name` previews the user-controlled name without encoding it. Live calls for the remaining Worker commands use the typed SDK and are encoded, but the preview still changes path structure. Keep this record Active until that special substitution applies the same path-segment encoding rule.

`packages/wrangler-tests/src/__tests__/secret.test.ts` now has an active special-character regression test. It asserts the decoded MSW route parameter is `the/key` and, importantly, that the raw request URL contains `/secrets/the%2Fkey` rather than a literal slash.

## Resolution scope

The original typed-SDK emitter fix came from the Forge SDK transformer. The remaining visible fix is cf-only: `generator/emit/handler/dry-run.ts` supplies the bare preview `scriptNameExpr` used by the shared path-template substitution. It should encode a supplied Worker name while leaving the missing-value placeholder readable, then regenerate the tracked commands. `generator/emit/build-context.ts` should apply the same rule before any future raw Worker operation consumes its live `scriptNameExpr`.

`encodeURIComponent` is correct for opaque path segments. It is not a complete model for the rare OpenAPI `allowReserved` case: current R2 object-key descriptions explicitly require literal slashes, while its generated REST URL still encodes them. That is a separate endpoint-contract gap requiring an explicit schema/generator signal, not a reason to regress general encoding.
