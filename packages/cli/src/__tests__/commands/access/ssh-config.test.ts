import { beforeEach, describe, expect, it, vi } from "vitest";
import { runCloudflared } from "../../../commands/cloudflared.js";
import { runCf } from "../../helpers/run-cf.js";

vi.mock("../../../commands/cloudflared.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	runCloudflared: vi.fn(),
}));

describe("cf access ssh-config", () => {
	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		vi.mocked(runCloudflared).mockReset();
		vi.mocked(runCloudflared).mockResolvedValue(0);
	});

	it("prints an SSH configuration through cloudflared", async () => {
		const result = await runCf([
			"access",
			"ssh-config",
			"--hostname",
			"ssh.example.com",
		]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"ssh-config",
			"--hostname",
			"ssh.example.com",
		]);
	});

	it("includes short-lived certificate configuration when requested", async () => {
		const result = await runCf(["access", "ssh-config", "--short-lived-cert"]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"ssh-config",
			"--short-lived-cert",
		]);
	});

	it("rejects FedRAMP before generating an incompatible configuration", async () => {
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "fedramp_high");

		await expect(runCf(["access", "ssh-config"])).rejects.toThrow(
			"cf access ssh-config does not support FedRAMP because cloudflared does not include --fedramp in its generated SSH configuration."
		);
		expect(runCloudflared).not.toHaveBeenCalled();
	});

	it("rejects local mode before starting cloudflared", async () => {
		await expect(runCf(["access", "ssh-config", "--local"])).rejects.toThrow(
			"--local is not supported by cf access ssh-config."
		);
		expect(runCloudflared).not.toHaveBeenCalled();
	});
});
