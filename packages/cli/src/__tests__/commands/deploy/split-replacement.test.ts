import * as clack from "@clack/prompts";
import { cancel } from "@cloudflare/cli-shared-helpers";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { createMockDeployContext } from "../../helpers/mock-deploy-context.js";
import { createFetchResult, msw, setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";
import {
	ACCOUNT_ID,
	buildOutputRootConfig,
	mockDefaultHandlers,
	mockExistingWorker,
	seedBuildDelegate,
	workerConfig,
} from "./helpers.js";
import type * as DeployHelpers from "@cloudflare/deploy-helpers";

vi.mock("../../../lib/deploy-context.js", () => ({
	createDeployContext: (authToken: string) =>
		createMockDeployContext(authToken),
}));

const deployHelpers = vi.hoisted(() => ({ deploy: vi.fn() }));

vi.mock("@cloudflare/deploy-helpers", async (importOriginal) => {
	const actual = await importOriginal<typeof DeployHelpers>();
	deployHelpers.deploy.mockImplementation(actual.deploy);
	return { ...actual, deploy: deployHelpers.deploy };
});

const SPLIT = [
	{ version_id: "version-a", percentage: 60 },
	{ version_id: "version-b", percentage: 40 },
];

/**
 * Serve an active deployment that splits traffic between two versions, and
 * record every request that would change the Worker's code or traffic.
 */
function mockActiveSplit() {
	const writes: string[] = [];
	msw.use(
		http.get(
			"*/accounts/:accountId/workers/scripts/:scriptName/deployments",
			() =>
				HttpResponse.json(
					createFetchResult({
						deployments: [
							{
								id: "split-deployment",
								source: "api",
								strategy: "percentage",
								created_on: "2026-11-01T00:00:00Z",
								versions: SPLIT,
							},
						],
					})
				)
		),
		http.get(
			"*/accounts/:accountId/workers/scripts/:scriptName/versions/:versionId",
			({ params }) =>
				HttpResponse.json(
					createFetchResult({
						id: params.versionId,
						number: 1,
						metadata: { created_on: "2026-11-01T00:00:00Z", source: "api" },
						annotations: {},
					})
				)
		),
		http.put("*/accounts/:accountId/workers/scripts/:scriptName", () => {
			writes.push("PUT script");
			return HttpResponse.json(
				createFetchResult({
					id: "new-version",
					etag: "etag",
					deployment_id: "new-deployment",
					startup_time_ms: 0,
				})
			);
		}),
		http.post(
			"*/accounts/:accountId/workers/scripts/:scriptName/versions",
			() => {
				writes.push("POST versions");
				return HttpResponse.json(
					createFetchResult({
						id: "new-version",
						startup_time_ms: 0,
						metadata: { has_preview: false },
						resources: { script: { etag: "etag" } },
					})
				);
			}
		),
		http.post(
			"*/accounts/:accountId/workers/scripts/:scriptName/deployments",
			() => {
				writes.push("POST deployments");
				return HttpResponse.json(createFetchResult({}));
			}
		)
	);
	return writes;
}

async function seedPrebuiltWorker() {
	await seed({
		".cloudflare/output/v1/config.json": buildOutputRootConfig(),
		".cloudflare/output/v1/workers/default/worker.config.json": workerConfig(),
		".cloudflare/output/v1/workers/default/bundle/index.js":
			"export default { fetch() { return new Response('ok'); } }",
	});
}

describe("cf deploy — replacing an active traffic split (#802)", () => {
	setupMsw();
	runInTempDir();
	const std = mockConsoleMethods();
	let success: ReturnType<typeof vi.spyOn>;
	let previousExitCode: typeof process.exitCode;

	beforeEach(async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		mockDefaultHandlers();
		mockExistingWorker();
		await seedBuildDelegate();
		await seedPrebuiltWorker();
		success = vi.spyOn(clack.log, "success").mockImplementation(() => {});
		previousExitCode = process.exitCode;
	});

	afterEach(() => {
		process.exitCode = previousExitCode;
		vi.restoreAllMocks();
	});

	it("refuses to replace the split in an unattended run without --force", async () => {
		const writes = mockActiveSplit();

		const { exitCode } = await runCf(["deploy", "--prebuilt"], { CI: "true" });

		// The active versions and their weights must be left as they are.
		expect(writes).toEqual([]);
		expect(exitCode).not.toBe(0);
		expect(success).not.toHaveBeenCalledWith(
			"Deploy complete",
			expect.anything()
		);
		expect(std.err).toContain("--force");
	});

	it("replaces the split in an unattended run with --force", async () => {
		const writes = mockActiveSplit();

		const { exitCode } = await runCf(["deploy", "--prebuilt", "--force"], {
			CI: "true",
		});

		expect(exitCode).toBe(0);
		expect(writes.length).toBeGreaterThan(0);
		expect(success).toHaveBeenCalledWith("Deploy complete", expect.anything());
	});

	it("reports a declined replacement as cancelled, with a nonzero exit status", async () => {
		const writes = mockActiveSplit();
		// Emulate deploy-helpers when the user answers "no" at the terminal
		// prompt: it cancels and returns without a version, setting no exit code.
		deployHelpers.deploy.mockImplementationOnce(async () => {
			cancel("Aborting deploy...");
			return { versionId: null, workerTag: null };
		});

		const { exitCode } = await runCf(["deploy", "--prebuilt"]);

		expect(writes).toEqual([]);
		expect(success).not.toHaveBeenCalledWith(
			"Deploy complete",
			expect.anything()
		);
		expect(exitCode).not.toBe(0);
	});
});
