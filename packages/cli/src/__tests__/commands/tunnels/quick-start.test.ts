import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCloudflared } from "../../../commands/cloudflared.js";
import { runCf } from "../../helpers/run-cf.js";

vi.mock("../../../commands/cloudflared.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	runCloudflared: vi.fn(),
}));

describe("cf tunnels quick-start", () => {
	beforeEach(() => {
		vi.mocked(runCloudflared).mockReset();
	});

	it("forwards quick-tunnel arguments to cloudflared", async () => {
		vi.mocked(runCloudflared).mockResolvedValueOnce(0);

		const result = await runCf([
			"tunnels",
			"quick-start",
			"http://localhost:3000",
			"--log-level",
			"trace",
		]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"tunnel",
			"--url",
			"http://localhost:3000",
			"--loglevel",
			"trace",
		]);
	});

	it("rejects local mode instead of silently ignoring it", async () => {
		await expect(
			runCf([
				"tunnels",
				"quick-start",
				"http://localhost:3000",
				"--local",
				"--persist-to",
				"state",
			])
		).rejects.toThrow("--local is not supported by cf tunnels quick-start.");
	});

	it("propagates cloudflared's exit code", async () => {
		vi.mocked(runCloudflared).mockResolvedValueOnce(7);

		const result = await runCf([
			"tunnels",
			"quick-start",
			"http://localhost:3000",
		]);

		expect(result.exitCode).toBe(7);
	});
});
