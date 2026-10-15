import { describe, it } from "vite-plus/test";
import { mockConsoleMethods } from "./helpers/mock-console";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

// This file is the wrangler-CLI bootstrap test suite: it asserts the exact
// shape of `wrangler --help`, the wrangler error formatting (`[ERROR]` chrome,
// "Please report any issues to .../workers-sdk/..."), the wrangler-only
// `logPossibleBugMessage` / `updateCheck` / `getPackageManager` helpers, and
// `wrangler build`. cf now uses yargs's native help renderer (same as
// wrangler) but with brand-orange section headers + a different banner +
// a different command catalogue (one chunk per generated product) +
// version channel — none of these snapshots apply. Per AGENTS.md "src/ is
// product-agnostic" + "UX Conventions". Only the global-flag situations that
// cf shares are ported.
describe("wrangler", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	describe("no command", () => {
		it.skip("should display a list of available commands");

		it("should not require temporary terms acceptance before root help", async ({
			expect,
		}) => {
			await runWrangler("--help --temporary-account");

			expect(std.out).toContain("cf");
			expect(std.out).toContain("Commands");
			expect(std.err).toBe("");
		});
	});

	describe("--temporary", () => {
		// Preserve this upstream test identity as an intentional divergence:
		// cf registers --temporary-account globally rather than requiring each
		// API command to opt in. `auth whoami` rejects the flag separately.
		it.skip("is rejected on commands that don't opt in");
	});

	describe("invalid command", () => {
		it.skip("should display an error");

		it.skip("should display an error even with --help flag");
	});

	describe("invalid flag on valid command", () => {
		it.skip("should display command-specific help for unknown flag");
	});

	describe("global options", () => {
		it.skip(
			"should display an error if duplicated --env or --config arguments are provided"
		);

		it.skip("should change cwd with --cwd");
	});

	describe("subcommand implicit help ran on incomplete command execution", () => {
		it.skip(
			"no subcommand for 'secret' should display a list of available subcommands"
		);

		it.skip(
			"no subcommand 'kv namespace' should display a list of available subcommands"
		);

		it.skip(
			"no subcommand 'kv key' should display a list of available subcommands"
		);

		it.skip(
			"no subcommand 'kv bulk' should display a list of available subcommands"
		);

		it.skip(
			"no subcommand 'r2' should display a list of available subcommands"
		);
	});

	it.skip("build should run `deploy --dry-run --outdir`");

	describe("logPossibleBugMessage()", () => {
		it.skip("should display a 'possible bug' message");

		it.skip(
			"should display a 'try updating' message if there is one available"
		);

		it.skip("should display a warning if Bun is in use");
	});
});
