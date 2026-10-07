import { describe, expect, it } from "vite-plus/test";
import { claudeArgs } from "../../commands/ai/claude/run.js";

describe("cf ai claude arguments", () => {
	it("adds the configured native Anthropic model", () => {
		expect(claudeArgs(["-p", "hello"], "anthropic/claude-sonnet-5")).toEqual([
			"--model",
			"claude-sonnet-5",
			"-p",
			"hello",
		]);
	});

	it("normalizes an explicitly prefixed model", () => {
		expect(
			claudeArgs(
				["--model", "anthropic/claude-sonnet-5", "-p", "hello"],
				"anthropic/claude-sonnet-5"
			)
		).toEqual(["--model", "claude-sonnet-5", "-p", "hello"]);
	});
});
