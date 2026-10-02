import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
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
		expect(stderr()).not.toContain("cf <command> [options]");
		expect(stderr()).toMatch(
			/Unknown command: unrecognizable[\s\S]*For more information, run cf --help/
		);
	});

	it.each(["--help", "-h"])(
		"rejects an unknown top-level command with %s",
		async (help) => {
			await expect(runCf(["malformed", help])).rejects.toThrow(
				"Unknown command: malformed"
			);

			expect(output.stdout()).toBe("");
			expect(stderr()).toContain("Unknown command: malformed");
			expect(stderr()).toContain("For more information, run cf --help");
		}
	);

	it("rejects an unknown command after a global option value", async () => {
		await expect(
			runCf(["--profile", "example", "unrecognizable", "--help"])
		).rejects.toThrow("Unknown command: unrecognizable");
	});

	it.each([
		["workers", "malformed"],
		["r2", "buckets", "unrecognizable"],
	])("rejects an unknown nested command in %j with --help", async (...path) => {
		const unknown = path.at(-1);
		const parent = path.slice(0, -1).join(" ");
		await expect(runCf([...path, "--help"])).rejects.toThrow(
			`Unknown command: ${unknown}`
		);

		expect(output.stdout()).toBe("");
		expect(stderr()).toContain(`For more information, run cf ${parent} --help`);
	});

	it("shows the parent help hint for an unknown nested command", async () => {
		await expect(runCf(["workers", "malformed"])).rejects.toThrow(
			"Unknown command: malformed"
		);

		expect(stderr()).not.toContain("cf workers\n");
		expect(stderr()).toMatch(
			/Unknown command: malformed[\s\S]*For more information, run cf workers --help/
		);
	});

	it("shows leaf help after an invalid flag", async () => {
		await expect(runCf(["workers", "list", "--malformed"])).rejects.toThrow(
			"Unknown argument: malformed"
		);

		expect(stderr()).toMatch(
			/Unknown argument: malformed[\s\S]*cf workers list/
		);
		expect(stderr()).toContain("List all Workers for an account.");
		expect(stderr()).toContain("Global flags");
	});

	it("shows the root help hint for an invalid global flag", async () => {
		await expect(runCf(["--malformed"])).rejects.toThrow(
			"Unknown argument: malformed"
		);

		expect(stderr()).toContain("For more information, run cf --help");
		expect(stderr()).toContain("cf --help to list global flags");
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

	it.each([
		[["r2", "buckets"], "cf r2 buckets"],
		[["r2", "buckets", "get", "example"], "cf r2 buckets get"],
		[["init", "./example"], "cf init"],
		[["ai", "run"], "cf ai run"],
		[
			["registrar", "registrations", "create"],
			"cf registrar registrations create",
		],
	])("keeps valid help successful for %j", async (path, heading) => {
		await expect(runCf([...path, "--help"])).resolves.toEqual({
			exitCode: 0,
		});

		expect(output.stdout()).toContain(heading);
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
		expect(stderr()).toContain(
			"For more information, run cf r2 buckets get --help"
		);
	});
});
