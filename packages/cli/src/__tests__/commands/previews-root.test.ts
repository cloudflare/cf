import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { runCf } from "../helpers/run-cf.js";

describe("cf previews group", () => {
	let out: ReturnType<typeof vi.spyOn>;
	let log: ReturnType<typeof vi.spyOn>;
	beforeEach(() => {
		out = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
		log = vi.spyOn(console, "log").mockImplementation(() => {});
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("keeps the deployment workflow available in group help", async () => {
		await runCf(["previews", "--help"]);
		const output =
			out.mock.calls.map((call: unknown[]) => String(call[0])).join("") +
			log.mock.calls.map((call: unknown[]) => String(call[0])).join("\n");
		expect(output).toContain("Manage Worker Previews");
		expect(output).toContain("previews deploy [preview-name]");
	});

	it("keeps local mode unavailable for Preview deployment", async () => {
		await expect(
			runCf(["previews", "deploy", "feature", "--local"])
		).rejects.toThrow("--local is not supported by cf previews deploy.");
	});

	it("keeps dry-run available without executing Preview deployment", async () => {
		const { exitCode } = await runCf([
			"previews",
			"deploy",
			"feature",
			"--prebuilt",
			"--dry-run",
		]);
		expect(exitCode).toBe(0);
		expect(JSON.parse(String(log.mock.calls[0]?.[0]))).toMatchObject({
			command: "cf previews deploy",
			dryRun: true,
			executed: false,
		});
	});
});
