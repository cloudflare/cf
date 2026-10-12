import { describe, test } from "vite-plus/test";

// Tests wrangler's tab-completion subsystem. cf has its own
// (`cf complete`, also backed by `@bomb.sh/tab` since this refactor).
// Behaviour overlaps but the registrations differ; tests for cf's
// completion live in cf, not here.
describe("wrangler", () => {
	describe("complete", () => {
		describe("complete --", () => {
			test.skip("should return top-level commands");

			test.skip("should return subcommands for namespace");

			test.skip("should return flags for a command");

			test.skip("should not include internal commands");

			test.skip("should handle deeply nested commands");

			test.skip("should output tab-separated format");

			test.skip("should return options with choices");
		});

		const shells = ["bash", "zsh", "fish"] as const;

		describe.each(shells)("%s", () => {
			test.skip("should output valid shell script");

			test.skip("should reference wrangler complete");
		});

		describe("bash", () => {
			test.skip("should generate valid bash syntax");

			test.skip("should define __wrangler_complete function");

			test.skip("should register completion with complete builtin");
		});

		describe("zsh", () => {
			test.skip("should generate valid zsh syntax");

			test.skip("should start with #compdef directive");

			test.skip("should define _wrangler function");

			test.skip("should register with compdef");
		});

		describe("fish", () => {
			test.skip("should generate valid fish syntax");

			test.skip("should define __wrangler_perform_completion function");

			test.skip("should register completion with complete builtin");

			test.skip("should use commandline for token extraction");
		});
	});
});
