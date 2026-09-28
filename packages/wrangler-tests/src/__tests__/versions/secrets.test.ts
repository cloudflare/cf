import { describe, it } from "vitest";

describe("versions upload --secrets-file", () => {
	// Every case in this file belongs to Wrangler's source-config-aware
	// bundling/upload pipeline. cf's hand-written `workers versions create`
	// accepts `--secrets-file` through its Build Output workflow, but these
	// cases assert Wrangler-specific config and binding-synthesis internals.
	it.skip(
		"should upload secrets from a JSON file alongside the Worker version"
	);
	it.skip(
		"should upload secrets from a .env file alongside the Worker version"
	);
	it.skip(
		"should set keep_bindings to inherit non-provided secrets when providing secrets file"
	);
	it.skip("should inherit secrets when not providing secrets file");
	it.skip("should fail when secrets file does not exist");
	it.skip(
		"should fail when secrets file is neither valid JSON nor .env format"
	);
	it.skip("should add inherit bindings for required secrets");
	it.skip("should error when required secrets are missing");
	it.skip(
		"should use inherit bindings only for required secrets not provided by --secrets-file"
	);
});
