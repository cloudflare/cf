import { writeFile } from "node:fs/promises";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCloudflared } from "../../../commands/cloudflared.js";
import { runCf } from "../../helpers/run-cf.js";

vi.mock("../../../commands/cloudflared.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	runCloudflared: vi.fn(),
}));

describe("cf tunnels login", () => {
	runInTempDir();

	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		vi.mocked(runCloudflared).mockReset();
		vi.mocked(runCloudflared).mockResolvedValue(0);
	});

	it("uses cloudflared's FedRAMP login flow for FedRAMP projects", async () => {
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "fedramp_high");

		const result = await runCf(["tunnels", "login"]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"tunnel",
			"login",
			"--fedramp",
		]);
	});

	it("uses dotenv compliance without exposing dotenv credentials to cloudflared", async () => {
		await writeFile(
			".env",
			[
				"CLOUDFLARE_API_TOKEN=file-token",
				"CLOUDFLARE_COMPLIANCE_REGION=fedramp_high",
			].join("\n")
		);
		let observedApiToken: string | undefined;
		vi.mocked(runCloudflared).mockImplementationOnce(async () => {
			observedApiToken = process.env.CLOUDFLARE_API_TOKEN;
			return 0;
		});

		const result = await runCf(["tunnels", "login"]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"tunnel",
			"login",
			"--fedramp",
		]);
		expect(observedApiToken).toBeUndefined();
	});

	it("starts cloudflared's tunnel login flow", async () => {
		const result = await runCf(["tunnels", "login"]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith(["tunnel", "login"]);
	});

	it("rejects local mode before starting cloudflared", async () => {
		await expect(runCf(["tunnels", "login", "--local"])).rejects.toThrow(
			"--local is not supported by cf tunnels login."
		);
		expect(runCloudflared).not.toHaveBeenCalled();
	});
});
