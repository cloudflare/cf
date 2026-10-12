import { describe, it } from "vite-plus/test";

// The entire `r2 data catalog force flag` suite exercises wrangler's
// client-side data-catalog guard for R2 mutations (`r2 object put`,
// `r2 object delete`, `r2 bulk put`, `r2 bucket lifecycle add/set/
// remove`):
//
//   1. Wrangler sends `cf-r2-data-catalog-check: true` on these
//      requests by default.
//   2. On a 409 with code 10081, wrangler prompts the user and retries
//      without the header on confirm.
//   3. `--force` / `-y` skips the header (and the prompt).
//
// cf has generated object upload and bulk-delete leaves, but not this
// data-catalog guard, manifest bulk uploader, or bucket-lifecycle
// add/remove/set helpers. The guard itself is wrangler client logic
// layered on top of those commands; even if cf grows the same
// endpoints via forge, the per-mutation header + 409-retry prompt is
// the kind of bespoke client behaviour that lives outside the
// generated path. Treat the whole file as wrangler-only.

describe("r2 data catalog force flag", () => {
	describe("object put", () => {
		it.skip(
			"should send catalog check header when force is NOT provided and NOT send header when flags are provided"
		);
		it.skip("should prompt on 409 and retry without header when user confirms");
		it.skip("should prompt on 409 and cancel when user declines");
	});

	describe("object delete", () => {
		it.skip(
			"should send catalog check header when force is NOT provided and NOT send header when flags are provided"
		);
		it.skip("should prompt on 409 and retry without header when user confirms");
		it.skip("should prompt on 409 and cancel when user declines");
	});

	describe("bulk put", () => {
		it.skip(
			"should prompt before bulk upload and send all objects without catalog header when confirmed"
		);
		it.skip("should cancel bulk upload when user declines prompt");
		it.skip("should NOT prompt and NOT send catalog header with --force");
	});

	describe("lifecycle add", () => {
		it.skip(
			"should send catalog check header when force is NOT provided and NOT send header when flags are provided"
		);
		it.skip("should prompt on 409 and retry without header when user confirms");
		it.skip("should prompt on 409 and cancel when user declines");
	});

	describe("lifecycle set", () => {
		it.skip(
			"should send catalog check header when force is NOT provided and NOT send header when flags are provided"
		);
		it.skip("should prompt on 409 and retry without header when user confirms");
		it.skip("should prompt on 409 and cancel when user declines");
	});

	describe("lifecycle remove", () => {
		it.skip(
			"should NOT send catalog check header (removes not relevant to catalog)"
		);
	});
});
