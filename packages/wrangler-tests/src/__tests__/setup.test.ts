import { describe, test } from "vite-plus/test";

// `wrangler setup` is the wrangler-internal autoconfig wizard (uses
// `../autoconfig/run`, `../output`, `../package-manager`,
// `@cloudflare/cli-shared-helpers/packages`). cf performs setup through
// autoconfig inside dev/build, or explicitly through `cf init` in a non-empty
// directory, rather than exposing `cf setup` or `cf workers setup`. Out of
// scope.
//
// The original `vi.mock("../package-manager", ...)` is dropped because the
// path no longer resolves; tests are skipped so the mock is unused anyway.
describe("wrangler setup", () => {
	test.skip("--help");

	test.skip("should skip autoconfig when project is already configured");

	test.skip("should run autoconfig when project is not configured");

	test.skip("should not display completion message when disabled");

	test.skip("should not install Wrangler when skipped");

	test.skip(
		"should output an autoconfig output entry to WRANGLER_OUTPUT_FILE_PATH"
	);

	describe("--dry-run", () => {
		test.skip(
			"should stop before running autoconfig when project is already configured"
		);

		test.skip(
			"should run autoconfig when project is not configured and stop at the summary step"
		);
	});
});
