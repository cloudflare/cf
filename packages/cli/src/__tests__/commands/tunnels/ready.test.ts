import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCloudflared } from "../../../commands/cloudflared.js";
import { runCf } from "../../helpers/run-cf.js";

vi.mock("../../../commands/cloudflared.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	runCloudflared: vi.fn(),
}));

describe("cf tunnels ready", () => {
	beforeEach(() => {
		vi.mocked(runCloudflared).mockReset();
		vi.mocked(runCloudflared).mockResolvedValue(0);
	});

	it("passes an explicit metrics address as a tunnel-level option", async () => {
		const result = await runCf([
			"tunnels",
			"ready",
			"--metrics",
			"127.0.0.1:20241",
		]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"tunnel",
			"--metrics",
			"127.0.0.1:20241",
			"ready",
		]);
	});

	it("requires the metrics address expected by cloudflared", async () => {
		await expect(runCf(["tunnels", "ready"])).rejects.toThrow(
			"Missing required argument: metrics"
		);
		expect(runCloudflared).not.toHaveBeenCalled();
	});

	it("rejects local mode before starting cloudflared", async () => {
		await expect(
			runCf(["tunnels", "ready", "--metrics", "127.0.0.1:20241", "--local"])
		).rejects.toThrow("--local is not supported by cf tunnels ready.");
		expect(runCloudflared).not.toHaveBeenCalled();
	});
});
