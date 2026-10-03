import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
});
