---
slug: r2-buckets-domains-custom-create-missing-zone-id
title: r2 custom-domain create dropped its body zoneId
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# R2 custom-domain create dropped `zoneId`

## Historical symptom

The R2 custom-domain endpoint has an account ID in its URL and a distinct, required `zoneId` in its JSON body. cf's old name-only suppression treated any body field named `zoneId` as the request-context zone and removed it, making a valid per-field invocation impossible.

## Current status

Fixed. `packages/cli/generator/arg-derivation.ts` now suppresses top-level account/zone body fields only when the operation path actually contains the matching container placeholder. The current generated `packages/cli/src/commands/_generated/r2/buckets/domains/custom/create.ts`:

- declares `--zone-id`;
- includes `zoneId` in the dry-run body;
- prompts for the required value when interactive; and
- writes it to the live POST body.

The custom-domain test in `packages/wrangler-tests/src/__tests__/r2/bucket.test.ts` is active and asserts the captured `zoneId`.

## Historical implementation note

An earlier draft deferred this fix because a global `--account-id` option could collide with body fields of the same name. That section is superseded: cf no longer registers a global account-id option, and the path-aware derivation has landed. The account is resolved by the auth/context layer; body-only identifiers remain ordinary generated flags.
