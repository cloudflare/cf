import { beforeEach, describe, expect, it, vi } from "vitest";
import { runCloudflared } from "../../../commands/cloudflared.js";
import { runCf } from "../../helpers/run-cf.js";

vi.mock("../../../commands/cloudflared.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	runCloudflared: vi.fn(),
}));

describe("cf tunnels diag", () => {
	beforeEach(() => {
		vi.mocked(runCloudflared).mockReset();
		vi.mocked(runCloudflared).mockResolvedValue(0);
	});

	it("forwards targeting and exclusion options in cloudflared scope", async () => {
		const result = await runCf([
			"tunnels",
			"diag",
			"--metrics",
			"127.0.0.1:20241",
			"--diag-container-id",
			"connector",
			"--diag-pod-id",
			"cloudflared-0",
			"--no-diag-logs",
			"--no-diag-network",
		]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"tunnel",
			"diag",
			"--metrics",
			"127.0.0.1:20241",
			"--diag-container-id",
			"connector",
			"--diag-pod-id",
			"cloudflared-0",
			"--no-diag-logs",
			"--no-diag-network",
		]);
	});

	it("rejects local mode before starting cloudflared", async () => {
		await expect(runCf(["tunnels", "diag", "--local"])).rejects.toThrow(
			"--local is not supported by cf tunnels diag."
		);
		expect(runCloudflared).not.toHaveBeenCalled();
	});
});
