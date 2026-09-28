---
slug: kv-bulk-update-delete-body-dropped
title: KV bulk update and delete dropped array bodies and did not batch them
status: Fixed
fix-location: both
last-verified: 2026-09-16
---

# KV bulk update and delete dropped array bodies and did not batch them

## Historical symptom

`kv bulk update` and `kv bulk delete` accept array-shaped request bodies. The old SDK/body classification treated zero flattenable object fields as no body, which could remove the typed body parameter or route the CLI into a bodyless call. The commands also lacked reliable client-side batching for the API's 10,000-item maximum. Destructive confirmation was a related overlay gap for bulk delete.

## Current status

Fixed in the generated implementation and SDK types.

- The SDK operation map represents both bulk methods with request types that include a typed `body`.
- `packages/cli/generator/arg-derivation.ts` explicitly excludes array bodies and referenced schemas from `hasEmptyBody` classification.
- Current `kv/bulk/update.ts` and `kv/bulk/delete.ts` parse `--body`, forward it through `requestApi`, and split arrays larger than 10,000 into 10,000-item requests.
- The forge KV schema supplies `maxItems: 10000`, which drives the generic batching emitter in `generator/emit/handler/body-bypass.ts`.
- The delete operation's forge confirmation annotation drives the one-time prompt and `--force/-f` surface.

No generated handler should be edited directly; regeneration derives all of this from the SDK operation map and forge metadata.

## Actual test state

`packages/wrangler-tests/src/__tests__/kv/bulk.test.ts` currently contains 3 active tests and 15 todos, not the 7 active/11 todo split previously documented.

The active tests prove one-request update, string-array delete, and object-array delete body forwarding. Both batching tests are still todo and retain stale 1,000/5,000-item titles even though the emitted threshold is 10,000. Decline, `--force`, and `-f` delete tests also remain todo despite the generated support. Other todos concern input validation and the separate unreachable bulk-get body path.

Thus the implementation bug is fixed, but the most important oversized-array regression coverage still needs promotion. Latest Wrangler source was checked for the corresponding bulk operations and test expectations.

## Fix location

Both: forge/SDK generation owns the accurate array body type, maximum-item metadata, and destructive annotation; cf owns conservative empty-body classification and generic body forwarding/batching emission.
