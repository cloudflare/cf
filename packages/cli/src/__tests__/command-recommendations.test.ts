import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureOutput } from "./helpers/capture-output.js";
import { runCf } from "./helpers/run-cf.js";

describe("command recommendations", () => {
	let output: ReturnType<typeof captureOutput>;
	let consoleError: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		output = captureOutput();
		consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	function stderr(): string {
		const consoleErrorOutput = consoleError.mock.calls
			.map((call: unknown[]) => String(call[0]))
			.join("\n");
		return `${output.stderr()}${consoleErrorOutput}`;
	}

	it.each([
		["acount", "accounts"],
		["acces", "access"],
	])("suggests close top-level command %s once", async (typo, command) => {
		await expect(runCf([typo])).rejects.toThrow(`Did you mean ${command}?`);

		expect(
			stderr().match(new RegExp(`Did you mean ${command}\\?`, "g"))
		).toHaveLength(1);
	});

	it("suggests a sibling command at the current nested level", async () => {
		await expect(runCf(["r2", "buckets", "lsit"])).rejects.toThrow(
			"Did you mean list?"
		);

		expect(stderr()).not.toContain("Did you mean r2?");
	});

	it("does not suggest a distant command", async () => {
		await expect(runCf(["unrecognizable"])).rejects.toThrow(
			"Unknown command: unrecognizable"
		);

		expect(stderr()).not.toContain("Did you mean");
	});

	it("does not suggest hidden commands", async () => {
		await expect(runCf(["toolz"])).rejects.toThrow("Unknown command: toolz");

		expect(stderr()).not.toContain("Did you mean tools?");
	});

	it("keeps top-level help successful", async () => {
		await expect(runCf(["--help"])).resolves.toEqual({ exitCode: 0 });

		expect(output.stdout()).toContain("cf <command> [options]");
		expect(stderr()).not.toContain("Did you mean");
	});

	it("keeps group help behavior when a subcommand is missing", async () => {
		await expect(runCf(["r2", "buckets"])).resolves.toEqual({ exitCode: 0 });

		expect(output.stdout()).toContain("cf r2 buckets");
		expect(stderr()).not.toContain("Did you mean");
	});

	it("keeps the missing positional error for leaf commands", async () => {
		await expect(runCf(["r2", "buckets", "get"])).rejects.toThrow(
			"Not enough non-option arguments: got 0, need at least 1"
		);

		expect(stderr()).not.toContain("Did you mean");
	});
});
