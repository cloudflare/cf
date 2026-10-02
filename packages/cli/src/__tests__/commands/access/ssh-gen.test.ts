import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCloudflared } from "../../../commands/cloudflared.js";
import { runCf } from "../../helpers/run-cf.js";

vi.mock("../../../commands/cloudflared.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	runCloudflared: vi.fn(),
}));

describe("cf access ssh-gen", () => {
	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		vi.mocked(runCloudflared).mockReset();
		vi.mocked(runCloudflared).mockResolvedValue(0);
	});

	it("uses the FedRAMP Access flow for FedRAMP projects", async () => {
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "fedramp_high");

		const result = await runCf([
			"access",
			"ssh-gen",
			"--hostname",
			"ssh.example.com",
		]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"--fedramp",
			"ssh-gen",
			"--hostname",
			"ssh.example.com",
		]);
	});

	it("generates a certificate through cloudflared", async () => {
		const result = await runCf([
			"access",
			"ssh-gen",
			"--hostname",
			"ssh.example.com",
		]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"ssh-gen",
			"--hostname",
			"ssh.example.com",
		]);
	});

	it("requires a hostname before starting cloudflared", async () => {
		await expect(runCf(["access", "ssh-gen"])).rejects.toThrow(
			"Missing required argument: hostname"
		);
	});

	it("rejects local mode before starting cloudflared", async () => {
		await expect(
			runCf(["access", "ssh-gen", "--hostname", "ssh.example.com", "--local"])
		).rejects.toThrow("--local is not supported by cf access ssh-gen.");
		expect(runCloudflared).not.toHaveBeenCalled();
	});

	it("propagates cloudflared's exit code", async () => {
		vi.mocked(runCloudflared).mockResolvedValueOnce(7);

		const result = await runCf([
			"access",
			"ssh-gen",
			"--hostname",
			"ssh.example.com",
		]);

		expect(result.exitCode).toBe(7);
	});
});
