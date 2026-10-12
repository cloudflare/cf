import { afterEach, beforeEach, describe, test } from "vite-plus/test";
import { mockConsoleMethods } from "./helpers/mock-console";
import { useMockIsTTY } from "./helpers/mock-istty";
import { runInTempDir } from "./helpers/run-in-tmp";

// This imported suite depends on Wrangler's source-config and helper shape.
// cf workers check profiles the default Build Output Worker instead and has
// first-class CLI coverage for that contract. This Wrangler-specific suite is
// out of scope.
//
// `../logger` (a wrangler-internal log-level singleton) is gone in cf, so the
// `afterEach` that called `logger.resetLoggerLevel()` is dropped — tests are
// skipped anyway, but the suite top-level still evaluates.
describe("wrangler check startup", () => {
	mockConsoleMethods();

	runInTempDir();
	const { setIsTTY } = useMockIsTTY();
	beforeEach(() => {
		setIsTTY(false);
	});
	afterEach(() => {
		// logger.resetLoggerLevel(); -- wrangler-internal, removed
	});

	test.skip("generates profile for basic worker");
	test.skip("generates profile for basic worker w/ sourcemaps");
	test.skip("--outfile works");
	test.skip("--args passed through to deploy");

	test.skip("--worker-bundle is used instead of building");

	test.skip("pages (config file)");

	test.skip("pages (args)");
});
