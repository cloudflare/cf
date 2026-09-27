import { afterEach, describe, expect, it, vi } from "vitest";
import { prepareProject } from "../../lib/autoconfig.js";
import type { AutoConfigDetails } from "@cloudflare/autoconfig";

const mocks = vi.hoisted(() => ({
	getDetailsForAutoConfig: vi.fn(),
	maybeMigrateWranglerProject: vi.fn(),
	runAutoConfig: vi.fn(),
}));

vi.mock("@cloudflare/autoconfig", () => ({
	AutoConfigDetectionError: class AutoConfigDetectionError extends Error {},
	getDetailsForAutoConfig: mocks.getDetailsForAutoConfig,
	runAutoConfig: mocks.runAutoConfig,
}));

vi.mock("../../lib/wrangler-migration.js", () => ({
	maybeMigrateWranglerProject: mocks.maybeMigrateWranglerProject,
}));

const unconfiguredDetails = {
	configured: false,
	projectPath: "/project",
	workerName: "worker",
	framework: {},
	outputDir: "dist",
	packageManager: {},
} as AutoConfigDetails;

describe("project preparation", () => {
	afterEach(() => vi.resetAllMocks());

	it("does not offer migration for a project already configured for cf", async () => {
		mocks.getDetailsForAutoConfig.mockResolvedValue({
			...unconfiguredDetails,
			configured: true,
		});

		await expect(prepareProject("/project")).resolves.toEqual({
			details: { ...unconfiguredDetails, configured: true },
		});
		expect(mocks.maybeMigrateWranglerProject).not.toHaveBeenCalled();
	});

	it("offers migration even when autoconfig cannot analyze the legacy project", async () => {
		const configuredDetails = {
			...unconfiguredDetails,
			configured: true,
		};
		mocks.getDetailsForAutoConfig
			.mockRejectedValueOnce(
				new (await import("@cloudflare/autoconfig")).AutoConfigDetectionError(
					"not detected",
					{
						telemetryMessage: "not detected",
						configured: false,
					}
				)
			)
			.mockResolvedValueOnce(configuredDetails);
		mocks.maybeMigrateWranglerProject.mockResolvedValue(true);

		await expect(prepareProject("/project")).resolves.toEqual({
			details: configuredDetails,
		});
		expect(mocks.getDetailsForAutoConfig).toHaveBeenCalledTimes(2);
		expect(mocks.runAutoConfig).not.toHaveBeenCalled();
	});

	it("runs autoconfig when migration is unavailable or declined", async () => {
		const configuration = {
			scripts: {},
			outputDir: "dist",
			buildCommand: "npm run build",
		};
		mocks.getDetailsForAutoConfig.mockResolvedValue(unconfiguredDetails);
		mocks.maybeMigrateWranglerProject.mockResolvedValue(false);
		mocks.runAutoConfig.mockResolvedValue(configuration);

		await expect(prepareProject("/project")).resolves.toEqual({
			details: unconfiguredDetails,
			configuration,
		});
		expect(mocks.runAutoConfig).toHaveBeenCalledOnce();
	});
});
