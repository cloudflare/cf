import { afterAll, describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs } from "./helpers/mock-dialogs";
import { runInTempDir } from "./helpers/run-in-tmp";

// This file ports `wrangler deployments` (the deprecated pre-versions
// command set) over to cf. cf's equivalent surface is
// `cf workers deployments {list,get,...}` against
// /accounts/:id/workers/scripts/:name/deployments — but the only two
// observable behaviours in the original wrangler suite are both
// wrangler-only artifacts (a wrangler-shaped help screen, and a
// wrangler-shaped deprecation error pointing at `versions view`).
// Neither has a cf analogue: cf doesn't gate `deployments view` behind
// a deprecation message, and `--help` output is generated from the
// forge metadata so its exact text belongs to the help-formatter
// tests, not here.
describe("deployments", () => {
	mockConsoleMethods();
	runInTempDir();
	mockAccountId();
	mockApiToken();
	afterAll(() => {
		clearDialogs();
	});

	// Wrangler-only: asserts wrangler's hand-written `deployments`
	// group help text ("🚢 List and view the current and past
	// deployments…", `wrangler deployments list`, `wrangler
	// deployments status`). cf has no `deployments` top-level group —
	// it lives under `cf workers deployments` and the help is
	// generator-derived.
	it.skip("should log a help message for deployments command");

	describe("deployments subcommands", () => {
		describe("deployment view", () => {
			// Wrangler-only: this test asserts that `wrangler
			// deployments view <id>` throws a deprecation error
			// directing users to `wrangler versions view`. cf has
			// `cf workers deployments get <id>` (no deprecation
			// gate) and no equivalent of the wrangler-side rename
			// shim.
			it.skip("should error with no flag");
		});
	});
});
