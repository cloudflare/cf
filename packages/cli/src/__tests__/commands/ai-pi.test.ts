import { describe, expect, it } from "vite-plus/test";
import { piArgs } from "../../commands/ai/pi/run.js";

describe("cf ai pi arguments", () => {
	it("adds the built-in AI Gateway provider and native model", () => {
		expect(piArgs(["--print", "hello"], "anthropic/claude-sonnet-5")).toEqual([
			"--model",
			"claude-sonnet-5",
			"--provider",
			"cloudflare-ai-gateway",
			"--print",
			"hello",
		]);
	});

	it("overrides provider routing and normalizes an explicit model", () => {
		expect(
			piArgs(
				["--provider", "anthropic", "--model", "anthropic/claude-sonnet-5"],
				"anthropic/claude-sonnet-5"
			)
		).toEqual([
			"--provider",
			"cloudflare-ai-gateway",
			"--model",
			"claude-sonnet-5",
		]);
	});
});
