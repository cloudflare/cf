import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCloudflared } from "../../../commands/cloudflared.js";
import { runCf } from "../../helpers/run-cf.js";

vi.mock("../../../commands/cloudflared.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	runCloudflared: vi.fn(),
}));

describe("cf access token", () => {
	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		vi.mocked(runCloudflared).mockReset();
		vi.mocked(runCloudflared).mockResolvedValue(0);
	});

	it("prints a token through cloudflared", async () => {
		const result = await runCf(["access", "token", "https://app.example.com"]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"token",
			"https://app.example.com",
		]);
	});

	it("requires an application URL", async () => {
		await expect(runCf(["access", "token"])).rejects.toThrow(
			"Not enough non-option arguments"
		);
		expect(runCloudflared).not.toHaveBeenCalled();
	});

	it("uses the FedRAMP Access flow from the compliance context", async () => {
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "fedramp_high");

		const result = await runCf(["access", "token", "https://app.example.com"]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"--fedramp",
			"token",
			"https://app.example.com",
		]);
	});

	it("rejects local mode before starting cloudflared", async () => {
		await expect(
			runCf(["access", "token", "https://app.example.com", "--local"])
		).rejects.toThrow("--local is not supported by cf access token.");
		expect(runCloudflared).not.toHaveBeenCalled();
	});
});
