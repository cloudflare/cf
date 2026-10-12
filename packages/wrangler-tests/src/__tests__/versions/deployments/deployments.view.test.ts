import { describe, test } from "vite-plus/test";

describe("deployments view", () => {
	// These are Wrangler's deprecated-command redirect messages. cf exposes
	// the API operation directly as `workers deployments get`.
	test.skip("error when run with no args", async () => {});
	test.skip("error when run with positional arg", async () => {});
});
