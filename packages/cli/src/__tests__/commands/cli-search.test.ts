import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { captureOutput } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";

describe("cf cli search", () => {
	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns five ranked JSON results with only command and summary", async () => {
		expect(await runCf(["cli", "search", "list zones"])).toEqual({
			exitCode: 0,
		});
		const results = JSON.parse(output.stdout()) as Record<string, string>[];
		expect(results).toHaveLength(5);
		expect(results[0]).toEqual({
			command: "cf zones list",
			summary: "List Zones",
		});
		for (const result of results) {
			expect(Object.keys(result).sort()).toEqual(["command", "summary"]);
		}
	});

	it("searches hidden commands", async () => {
		expect(
			await runCf(["cli", "search", "abuse-reports appeals eligibility"])
		).toEqual({ exitCode: 0 });
		const results = JSON.parse(output.stdout()) as Record<string, string>[];
		expect(results[0]?.command).toBe("cf abuse-reports appeals eligibility");
		output.clear();
		await runCf(["cli", "search", "mitigation appeal could reverse"]);
		const byDescription = JSON.parse(output.stdout()) as Record<
			string,
			string
		>[];
		expect(byDescription[0]?.command).toBe(
			"cf abuse-reports appeals eligibility"
		);
	});
});
