---
slug: r2-object-not-generated
title: Wrangler-style R2 object parity remains incomplete
status: Punted
fix-location: upstream-spec
last-verified: 2026-09-16
---

# Wrangler-style R2 object parity remains incomplete

## Current generated surface

The original report predated most REST object routes. cf now generates five leaves under `r2 buckets objects`:

```text
get <object-key> --bucket-name <bucket> [--text]
upload <object-key> --bucket-name <bucket> [--file <path>] [--body <value>]  # one is required; --file wins when both are supplied
delete <object-key> --bucket-name <bucket> [--force]
list --bucket-name <bucket> [--prefix ... --cursor ...]
bulk-delete --bucket-name <bucket> --body <json> [--force]
```

Upload also exposes content type/length, jurisdiction, and storage-class headers. Get writes raw bytes to stdout by default, so shell redirection provides a download-to-file path. These additions mean the earlier claims that cf lacked object list/delete, storage class, or a basic binary file upload are no longer accurate.

## Remaining gap

Wrangler's `r2 object` and `r2 bulk` commands use the S3-compatible data plane and still provide behavior not represented by the generated REST operations, including Wrangler's exact `<bucket>/<key>` shape, `--pipe` input, richer conditional/fetch options, client-side catalog safety, and manifest-driven bulk upload. R2 SQL is also a separate, ungenerated data-plane surface.

The preambles and todos in `packages/wrangler-tests/src/__tests__/r2/{object,bulk,pipe,catalog-force,errors}.test.ts` record which Wrangler scenarios still lack a cf equivalent. Local object upload/get and bulk-delete coverage now exists in `r2/local.test.ts`.

## Status and resolution direction

Punted as an explicit follow-up, not wholly missing. REST-representable features should be added to the API schema/Forge surface. S3-only behavior may need a bounded hand-written client or an alternate-host/data-plane primitive. Manifest operations need API/Forge batch-input support or an approved bounded hand-written workflow; the generic compound-command primitive is retired.

One endpoint-specific concern remains: the R2 schema descriptions say slashes inside object keys must be sent literally, while current generated URLs use `encodeURIComponent` for every path parameter. That allow-reserved exception needs explicit schema/generator support rather than weakening path encoding globally.
