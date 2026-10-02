import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCloudflared } from "../../../commands/cloudflared.js";
import { runCf } from "../../helpers/run-cf.js";

const telemetryEvents = vi.hoisted(
	() => [] as Array<{ name: string; properties: Record<string, unknown> }>
);

vi.mock("../../../commands/cloudflared.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	runCloudflared: vi.fn(),
}));

vi.mock("../../../lib/telemetry/dispatcher.js", () => ({
	getTelemetryDispatcher: () => ({
		enabled: true,
		sendCommandEvent: (name: string, properties: Record<string, unknown>) =>
			telemetryEvents.push({ name, properties }),
		sendAdhocEvent: vi.fn(),
	}),
}));

describe("cf access curl", () => {
	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		vi.mocked(runCloudflared).mockReset();
		vi.mocked(runCloudflared).mockResolvedValue(0);
		telemetryEvents.length = 0;
	});

	it.each(["--allow-request", "-ar"])(
		"places %s before the application URL for cloudflared",
		async (allowRequest) => {
			const result = await runCf([
				"access",
				"curl",
				allowRequest,
				"https://app.example.com/path",
			]);

			expect(result.exitCode).toBe(0);
			expect(runCloudflared).toHaveBeenCalledWith([
				"access",
				"curl",
				"--allow-request",
				"https://app.example.com/path",
			]);
		}
	);

	it("uses the FedRAMP Access flow for FedRAMP projects", async () => {
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "fedramp_high");

		const result = await runCf([
			"access",
			"curl",
			"https://app.example.com/path",
		]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"--fedramp",
			"curl",
			"https://app.example.com/path",
		]);
	});

	it("forwards trailing curl arguments", async () => {
		const result = await runCf([
			"access",
			"curl",
			"https://app.example.com/path",
			"--",
			"-I",
			"--header",
			"Accept: application/json",
		]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"curl",
			"https://app.example.com/path",
			"-I",
			"--header",
			"Accept: application/json",
		]);
	});

	it("records lifecycle telemetry without inspecting curl arguments", async () => {
		await runCf([
			"access",
			"curl",
			"https://secret.example.com/path?token=url-secret",
			"--",
			"--header",
			"Authorization: Bearer header-secret",
		]);

		expect(telemetryEvents.map((event) => event.name)).toEqual([
			"cf command started",
			"cf command finished",
		]);
		for (const event of telemetryEvents) {
			expect(event.properties).toMatchObject({
				command: "access curl",
				sanitizedArgs: {},
				argsUsed: [],
				argsCombination: "",
			});
		}
		expect(JSON.stringify(telemetryEvents)).not.toContain("url-secret");
		expect(JSON.stringify(telemetryEvents)).not.toContain("header-secret");
	});

	it("rejects curl arguments without the -- separator", async () => {
		await expect(
			runCf(["access", "curl", "https://app.example.com/path", "-I"])
		).rejects.toThrow("Unknown argument: I");
	});

	it("forwards curl flags that collide with cf flags after --", async () => {
		const result = await runCf([
			"access",
			"curl",
			"https://app.example.com/path",
			"--",
			"-q",
			"--local",
		]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith([
			"access",
			"curl",
			"https://app.example.com/path",
			"-q",
			"--local",
		]);
	});

	it("rejects local mode before starting cloudflared", async () => {
		await expect(
			runCf(["access", "curl", "https://app.example.com", "--local"])
		).rejects.toThrow("--local is not supported by cf access curl.");
		expect(runCloudflared).not.toHaveBeenCalled();
	});
});
