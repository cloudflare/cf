import { writeFile } from "node:fs/promises";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCloudflared } from "../../../commands/cloudflared.js";
import { runCf } from "../../helpers/run-cf.js";

vi.mock("../../../commands/cloudflared.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	runCloudflared: vi.fn(),
}));

describe("cf access login", () => {
	runInTempDir();

	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		vi.mocked(runCloudflared).mockReset();
		vi.mocked(runCloudflared).mockResolvedValue(0);
	});

	it("restores dotenv credentials before starting cloudflared", async () => {
		await writeFile(
			".env",
			[
				"CLOUDFLARE_API_TOKEN=file-token",
				"CLOUDFLARE_COMPLIANCE_REGION=fedramp_high",
			].join("\n")
		);
		let inheritedApiToken: string | undefined;
		vi.mocked(runCloudflared).mockImplementationOnce(async () => {
			inheritedApiToken = process.env.CLOUDFLARE_API_TOKEN;
			return 0;
		});

		const result = await runCf(["access", "login", "https://app.example.com"]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"--fedramp",
			"login",
			"https://app.example.com",
		]);
		expect(inheritedApiToken).toBeUndefined();
	});

	it("uses the FedRAMP Access flow for FedRAMP projects", async () => {
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "fedramp_high");

		const result = await runCf(["access", "login", "https://app.example.com"]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"--fedramp",
			"login",
			"https://app.example.com",
		]);
	});

	it("starts the Access login flow", async () => {
		const result = await runCf(["access", "login", "https://app.example.com"]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"login",
			"https://app.example.com",
		]);
	});

	it("forwards the global quiet flag to cloudflared login", async () => {
		const result = await runCf([
			"access",
			"login",
			"https://app.example.com",
			"--quiet",
		]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"login",
			"--quiet",
			"https://app.example.com",
		]);
	});

	it("rejects local mode before starting cloudflared", async () => {
		await expect(
			runCf(["access", "login", "https://app.example.com", "--local"])
		).rejects.toThrow("--local is not supported by cf access login.");
		expect(runCloudflared).not.toHaveBeenCalled();
	});
});
