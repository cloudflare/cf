import * as clack from "@clack/prompts";
import { describe, expect, it, vi } from "vitest";

const cancelResult = vi.hoisted(() => Symbol("test dialog cancellation"));

vi.mock("@clack/core", () => ({
	isCancel: (value: unknown) => value === cancelResult,
}));

vi.mock("@clack/prompts", () => ({
	confirm: vi.fn(),
	select: vi.fn(),
	text: vi.fn(),
}));

vi.mock("../../lib/interactive.js", () => ({
	isNonInteractiveOrCI: () => false,
}));

import { confirm, prompt, select } from "../../lib/dialog.js";

const cancellation = { name: "CliExit", code: 130, cancelled: true };

describe("dialog cancellation", () => {
	it("marks confirmation cancellation", async () => {
		vi.mocked(clack.confirm).mockResolvedValue(cancelResult as never);

		await expect(
			confirm("Continue?", { defaultValue: false })
		).rejects.toMatchObject(cancellation);
	});

	it("marks text prompt cancellation", async () => {
		vi.mocked(clack.text).mockResolvedValue(cancelResult as never);

		await expect(prompt("Name")).rejects.toMatchObject(cancellation);
	});

	it("marks selection cancellation", async () => {
		vi.mocked(clack.select).mockResolvedValue(cancelResult as never);

		await expect(
			select("Choose", {
				choices: [{ title: "One", value: "one" }],
			})
		).rejects.toMatchObject(cancellation);
	});
});
