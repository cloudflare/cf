import * as clack from "@clack/prompts";
import { describe, expect, it, vi } from "vite-plus/test";

interface CapturedAuthContext {
	prompt: (question: string) => Promise<string>;
	select: (
		text: string,
		options: { choices: { title: string; value: string }[] }
	) => Promise<string>;
}

const testState = vi.hoisted(() => ({
	cancelResult: Symbol("test oauth cancellation"),
	context: undefined as CapturedAuthContext | undefined,
}));

vi.mock("@clack/core", () => ({
	isCancel: (value: unknown) => value === testState.cancelResult,
}));

vi.mock("@clack/prompts", () => ({
	select: vi.fn(),
	text: vi.fn(),
}));

vi.mock("@cloudflare/workers-auth/cf", () => ({
	createCfAuth: (context: CapturedAuthContext) => {
		testState.context = context;
		return {};
	},
	createCfProfileStore: vi.fn(),
	validateScopeKeys: vi.fn(),
}));

vi.mock("../../lib/interactive.js", () => ({
	isNonInteractiveOrCI: () => false,
}));

await import("../../lib/oauth/index.js");

describe("OAuth prompt cancellation", () => {
	const cancellation = { name: "CliExit", code: 130, cancelled: true };
	const context = (): CapturedAuthContext => {
		if (!testState.context) {
			throw new Error("OAuth context was not initialized");
		}
		return testState.context;
	};

	it("throws CliExit from text prompts", async () => {
		vi.mocked(clack.text).mockResolvedValue(testState.cancelResult as never);

		await expect(context().prompt("Account ID")).rejects.toMatchObject(
			cancellation
		);
	});

	it("throws CliExit from selection prompts", async () => {
		vi.mocked(clack.select).mockResolvedValue(testState.cancelResult as never);

		await expect(
			context().select("Choose an account", {
				choices: [{ title: "Example", value: "account-id" }],
			})
		).rejects.toMatchObject(cancellation);
	});
});
