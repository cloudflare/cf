import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCompletionDescription } from "../commands/completions/index.js";
import { captureOutput } from "./helpers/capture-output.js";
import { runCf } from "./helpers/run-cf.js";
import type { CommandMeta } from "../lib/metadata.js";

const metadata = await import("../commands/_generated/_meta/commands.json", {
	with: { type: "json" },
});
const zonesList = (metadata.default.commands as CommandMeta[]).find(
	(command) => command.command === "cf zones list"
);

function normalizeWhitespace(value: string): string {
	return value.replace(/\s+/g, " ").trim();
}

describe("generated command descriptions", () => {
	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("uses summaries in command listings", async () => {
		await expect(runCf(["zones", "--help"])).resolves.toEqual({
			exitCode: 0,
		});

		expect(output.stdout()).toContain("List Zones");
		expect(output.stdout()).not.toContain(
			"Lists, searches, sorts, and filters your zones."
		);
	});

	it("retains both forms in generated metadata", () => {
		expect(zonesList?.summary).toBe("List Zones");
		expect(zonesList?.description).toContain(
			"Lists, searches, sorts, and filters your zones."
		);
	});

	it("uses summaries in completions with a legacy metadata fallback", () => {
		expect(getCompletionDescription(zonesList as CommandMeta)).toBe(
			"List Zones"
		);
		expect(
			getCompletionDescription({
				description: "Full description",
			} as CommandMeta)
		).toBe("Full description");
		expect(getCompletionDescription({} as CommandMeta)).toBe("");
	});

	it("uses full descriptions in leaf help", async () => {
		await expect(runCf(["zones", "list", "--help"])).resolves.toEqual({
			exitCode: 0,
		});

		const help = normalizeWhitespace(output.stdout());
		expect(help).toContain("Lists, searches, sorts, and filters your zones.");
		expect(help).toContain(
			"Listing zones across more than 500 accounts is currently not allowed."
		);
	});
});
