import { describe, it } from "vitest";

// Skipped: every test in this file exercises wrangler's `r2 bulk put`
// command, which performs manifest-driven bulk uploads of R2 objects. cf's
// generated object surface supports upload and bulk-delete, but not this
// compound bulk-upload workflow.
// See `test_bugs/r2-object-not-generated.md`.
describe("r2", () => {
	describe("bulk", () => {
		it.todo("should show help when the bulk command is passed");

		describe("remote", () => {
			it.todo("should bulk upload R2 objects to bucket");
			it.todo("should bulk upload R2 with storage class to bucket");
			it.todo(
				"should fail to bulk upload R2 objects if the list doesn't exist"
			);
			it.todo(
				"should fail to bulk upload R2 objects if the list format is invalid"
			);
			it.todo(
				"should fail to bulk upload R2 objects if the list contain invalid entries"
			);
			it.todo(
				"should fail to bulk upload R2 objects if the list contain a non existent file"
			);
			it.todo("should fail to bulk upload R2 objects if too large");
			it.todo("should fail to bulk upload R2 objects if the name is invalid");
			it.todo(
				"should pass all fetch option flags into requestInit & check request inputs"
			);
			it.todo(
				"should allow --env and --expires to be used together without conflict"
			);
		});
	});
});
