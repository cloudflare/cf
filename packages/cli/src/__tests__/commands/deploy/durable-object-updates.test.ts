import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createMockDeployContext } from "../../helpers/mock-deploy-context.js";
import { setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";
import {
	ACCOUNT_ID,
	buildOutputRootConfig,
	captureDeployment,
	mockDefaultHandlers,
	mockExistingWorker,
	mockWorkerUpload,
	workerConfig,
} from "./helpers.js";

vi.mock("../../../lib/deploy-context.js", () => ({
	createDeployContext: (authToken: string) =>
		createMockDeployContext(authToken),
}));

describe("Durable Object code updates", () => {
	setupMsw();
	runInTempDir();
	mockConsoleMethods();

	beforeEach(async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		mockDefaultHandlers();
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default {}",
		});
	});

	it.each([
		[[], { mode: "deferred", max_delay: 300 }],
		[
			["--durable-objects-code-update-mode", "immediate"],
			{ mode: "immediate" },
		],
		[
			["--durable-objects-code-update-mode", "deferred"],
			{ mode: "deferred", max_delay: 300 },
		],
		[
			[
				"--durable-objects-code-update-mode",
				"deferred",
				"--durable-objects-code-update-max-delay",
				"0",
			],
			{ mode: "deferred", max_delay: 0 },
		],
		[
			[
				"--durable-objects-code-update-mode",
				"deferred",
				"--durable-objects-code-update-max-delay",
				"30.001",
			],
			{ mode: "deferred", max_delay: 30.001 },
		],
	] as const)("includes %j in new Worker uploads", async (flags, expected) => {
		const upload = mockWorkerUpload();
		expect((await runCf(["deploy", "--prebuilt", ...flags])).exitCode).toBe(0);
		expect(upload.metadata?.code_update_strategy).toEqual(expected);
	});

	it.each([
		[[], { mode: "deferred", max_delay: 300 }],
		[
			["--durable-objects-code-update-mode", "immediate"],
			{ mode: "immediate" },
		],
	] as const)(
		"includes %j when deploying an existing Worker version",
		async (flags, expected) => {
			mockExistingWorker();
			mockWorkerUpload();
			const deployment = captureDeployment();
			expect((await runCf(["deploy", "--prebuilt", ...flags])).exitCode).toBe(
				0
			);
			expect(deployment.body?.code_update_strategy).toEqual(expected);
		}
	);

	it.each(["-1", "86400.001", "0.0001", "Infinity", "NaN"])(
		"rejects invalid delays (%s) before uploading",
		async (delay) => {
			const upload = mockWorkerUpload();
			await expect(
				runCf([
					"deploy",
					"--prebuilt",
					"--durable-objects-code-update-mode",
					"deferred",
					"--durable-objects-code-update-max-delay",
					delay,
				])
			).rejects.toThrow(/between 0 and 86400/);
			expect(upload.metadata).toBeUndefined();
		}
	);

	it.each([
		{ flags: [] },
		{ flags: ["--durable-objects-code-update-mode", "immediate"] },
	])("requires deferred mode for a delay (%j)", async ({ flags }) => {
		await expect(
			runCf([
				"deploy",
				"--prebuilt",
				...flags,
				"--durable-objects-code-update-max-delay",
				"30",
			])
		).rejects.toThrow(/requires.*deferred/);
	});

	it("rejects unknown modes", async () => {
		await expect(
			runCf([
				"deploy",
				"--prebuilt",
				"--durable-objects-code-update-mode",
				"deferrred",
			])
		).rejects.toThrow();
	});
});
