import { describe, it } from "vitest";

describe("containers images list", () => {
	it.skip("should help");
	// The generated surface currently exposes image preparation, but not the
	// managed-registry list and delete endpoints exercised by Wrangler.
	it.todo("should list images");
	it.todo("should list images with a filter");
	it.todo("should list repos as valid json with json flag set");
});

describe("containers images delete", () => {
	it.skip("should help");
	it.todo("should delete images");
	it.todo("should error when provided a repo without a tag");
	it.todo("should prompt for confirmation and proceed when confirmed");
	it.todo("should cancel deletion when user declines");
	it.skip("should skip confirmation with --skip-confirmation flag");
	it.skip("should skip confirmation with -y flag");
});
