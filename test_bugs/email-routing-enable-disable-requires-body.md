---
slug: email-routing-enable-disable-requires-body
title: Bodyless POST commands incorrectly required `--body`
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# Bodyless POST commands incorrectly required `--body`

## Historical symptom

`cf email-routing enable` and `cf email-routing disable` failed unless the user passed `--body {}`, although both API operations are bodyless POSTs. The same empty-body classification problem affected sending a Workflow event without a payload.

The generator used the mere presence of an OpenAPI `requestBody` node as proof that a payload was required. Some Cloudflare API operations used an empty request-body placeholder, so the generated handler rejected a valid no-body request before reaching the SDK.

## Current status

Fixed. Generic empty-body detection is now centralized in `packages/cli/generator/arg-derivation.ts`; the required-body guard in `generator/emit/handler/sdk-call.ts` excludes operations classified as empty. The predicate also protects real payloads by refusing to collapse referenced, array, multipart, or non-JSON bodies.

The present generated command shapes are simpler than the earlier document claimed:

- `email-routing/enable.ts` and `email-routing/disable.ts` expose no `--body` option and call their typed SDK methods without a body.
- The Workflow command is now `workflows instances events send`, not `events create`. It also has no request-body surface and succeeds without a payload.

Active Email Routing tests cover bodyless enable and disable. The Workflow suite has an active no-payload event test, including an active local-runtime case. Payload support remains a separate gap: the "with payload" test is still `it.todo` because the current generated Workflow command cannot accept one.

## Fix location

cf-only. The solution is generic generator interpretation, not product-specific source code. See `delete-no-body-requires-body.md` for the same historical bug on DELETE operations.
