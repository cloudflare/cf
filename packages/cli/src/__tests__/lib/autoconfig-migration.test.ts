import { afterEach, describe, expect, it, vi } from "vite-plus/test";
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

	it("does not run setup for a configured project during a dry run", async () => {
		const configuredDetails = { ...unconfiguredDetails, configured: true };
		mocks.getDetailsForAutoConfig.mockResolvedValue(configuredDetails);

		await expect(prepareProject("/project", { dryRun: true })).resolves.toEqual(
			{
				details: configuredDetails,
			}
		);
		expect(mocks.maybeMigrateWranglerProject).not.toHaveBeenCalled();
		expect(mocks.runAutoConfig).not.toHaveBeenCalled();
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

	it("runs framework setup when Wrangler config conversion did not run", async () => {
		const configuration = {
			scripts: {},
			outputDir: "dist",
			buildCommand: "npm run build",
		};
		const configuredDetails = {
			...unconfiguredDetails,
			configured: true,
			devCommand: "npx vite dev",
			env: { CONFIGURED: "true" },
		};
		mocks.getDetailsForAutoConfig
			.mockResolvedValueOnce(unconfiguredDetails)
			.mockResolvedValueOnce(configuredDetails);
		mocks.maybeMigrateWranglerProject.mockResolvedValue(false);
		mocks.runAutoConfig.mockResolvedValue(configuration);

		await expect(prepareProject("/project")).resolves.toEqual({
			details: configuredDetails,
			configuration,
		});
		expect(mocks.runAutoConfig).toHaveBeenCalledWith(
			unconfiguredDetails,
			expect.objectContaining({ runBuild: false })
		);
		expect(mocks.getDetailsForAutoConfig).toHaveBeenCalledTimes(2);
	});

	it("keeps the pre-setup details when the configured project cannot be analyzed", async () => {
		const configuration = { scripts: {}, outputDir: "dist" };
		mocks.getDetailsForAutoConfig
			.mockResolvedValueOnce(unconfiguredDetails)
			.mockRejectedValueOnce(
				new (await import("@cloudflare/autoconfig")).AutoConfigDetectionError(
					"not detected",
					{
						telemetryMessage: "not detected",
						configured: false,
					}
				)
			);
		mocks.maybeMigrateWranglerProject.mockResolvedValue(false);
		mocks.runAutoConfig.mockResolvedValue(configuration);

		await expect(prepareProject("/project")).resolves.toEqual({
			details: unconfiguredDetails,
			configuration,
		});
	});

	it("dry-runs framework setup when Wrangler config conversion did not run", async () => {
		mocks.getDetailsForAutoConfig.mockResolvedValue(unconfiguredDetails);
		mocks.maybeMigrateWranglerProject.mockResolvedValue(false);
		mocks.runAutoConfig.mockResolvedValue({ buildCommand: "npm run build" });

		await expect(
			prepareProject("/project", { dryRun: true })
		).resolves.toMatchObject({
			details: unconfiguredDetails,
			setupNeeded: true,
		});
		expect(mocks.runAutoConfig).toHaveBeenCalledWith(
			unconfiguredDetails,
			expect.objectContaining({ dryRun: true, runBuild: false })
		);
		expect(mocks.getDetailsForAutoConfig).toHaveBeenCalledOnce();
		expect(mocks.maybeMigrateWranglerProject).toHaveBeenCalledWith(
			"/project",
			expect.any(Function),
			undefined,
			true
		);
	});

	it("stops after an accepted Wrangler config conversion dry run", async () => {
		mocks.getDetailsForAutoConfig.mockResolvedValue(unconfiguredDetails);
		mocks.maybeMigrateWranglerProject.mockResolvedValue(true);

		await expect(prepareProject("/project", { dryRun: true })).resolves.toEqual(
			{
				details: unconfiguredDetails,
				setupNeeded: true,
			}
		);
		expect(mocks.maybeMigrateWranglerProject).toHaveBeenCalledWith(
			"/project",
			expect.any(Function),
			undefined,
			true
		);
		expect(mocks.getDetailsForAutoConfig).toHaveBeenCalledOnce();
		expect(mocks.runAutoConfig).not.toHaveBeenCalled();
	});
});
