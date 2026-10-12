import { describe, it } from "vite-plus/test";

// cf generates REST-backed object get, upload, and bulk-delete commands under
// `r2 objects`. Wrangler's `r2 object *` commands use a different
// S3-style shape and include behavior the generated leaves do not provide.
//
// These tests remain todo until their Wrangler behavior is mapped onto the
// generated leaves or cf grows hand-written compatibility commands. Tracked in
// `test_bugs/r2-object-not-generated.md`.
//
// Each `it.todo` below corresponds 1:1 to the original wrangler test
// name; restoring them is a matter of:
//   1. Extending the generated `r2 objects` surface where possible.
//   2. Translating: wrangler `r2 object get <bucket>/<key> --file <path>`
//      → cf `r2 objects get <key> --bucket-name <bucket>`
//      with cf's `outputKind: 'raw-bytes'` for downloaded bodies and
//      `--file @<path>` for uploads.

describe("r2", () => {
	describe("object", () => {
		it.todo("should show help when the object command is passed");

		describe("remote", () => {
			it.todo("should download R2 object from bucket");
			it.todo("should download R2 object from bucket into directory");
			it.todo("should upload R2 object to bucket");
			it.todo("should upload R2 object with storage class to bucket");
			it.todo("should fail to upload R2 object to bucket if too large");
			it.todo(
				"should fail to upload R2 object to bucket if the name is invalid"
			);
			it.todo(
				"should pass all fetch option flags into requestInit & check request inputs"
			);
			it.todo("should delete R2 object from bucket");

			// Wrangler-only: `--pipe` reads stdin into the request body. cf has
			// no equivalent flag — the closest analogue is shell pipe + cf's
			// `--file @-` (planned) — and the mutual-exclusion error doesn't
			// apply because there's no `--pipe` to be exclusive with.
			it.skip("should not allow `--pipe` & `--file` to run together");

			// Wrangler-only: `--env <name>` selects a wrangler.toml environment.
			// cf doesn't read worker config — see AGENTS.md "cf does NOT read
			// project worker config".
			it.skip(
				"should allow --env and --expires to be used together without conflict"
			);
		});
	});
});
