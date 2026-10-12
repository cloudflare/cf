import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { DEPENDENCIES_INSTRUMENTATION_ENV_VAR } from "../../../lib/dependencies-instrumentation.js";
import { createMockDeployContext } from "../../helpers/mock-deploy-context.js";
import { setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";
import {
	ACCOUNT_ID,
	mockDefaultHandlers,
	mockExistingWorker,
	mockWorkerUpload,
	seedBuildDelegate,
	buildOutputRootConfig,
	workerConfig,
} from "./helpers.js";

vi.mock("../../../lib/deploy-context.js", () => ({
	createDeployContext: (authToken: string) =>
		createMockDeployContext(authToken),
}));

describe("cf deploy — upload metadata", () => {
	setupMsw();
	runInTempDir();
	mockConsoleMethods();

	beforeEach(async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		vi.stubEnv(DEPENDENCIES_INSTRUMENTATION_ENV_VAR, undefined);
		mockDefaultHandlers();
		await seedBuildDelegate();
	});

	async function seedWorkerWithDependency() {
		await seed({
			"package.json": JSON.stringify({
				dependencies: { "example-dependency": "^1.0.0" },
			}),
			"node_modules/example-dependency/package.json": JSON.stringify({
				name: "example-dependency",
				version: "1.2.3",
			}),
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});
	}

	it("includes package dependencies by default", async () => {
		const upload = mockWorkerUpload();
		await seedWorkerWithDependency();

		const { exitCode } = await runCf(["deploy", "--prebuilt"]);

		expect(exitCode).toBe(0);
		expect(upload.metadata?.package_dependencies).toEqual([
			{
				name: "example-dependency",
				packageJsonVersion: "^1.0.0",
				installedVersion: "1.2.3",
			},
		]);
	});

	it("omits package dependencies when instrumentation is disabled", async () => {
		vi.stubEnv(DEPENDENCIES_INSTRUMENTATION_ENV_VAR, "false");
		const upload = mockWorkerUpload();
		await seedWorkerWithDependency();

		const { exitCode } = await runCf(["deploy", "--prebuilt"]);

		expect(exitCode).toBe(0);
		expect(upload.metadata?.package_dependencies).toBeUndefined();
	});

	it("rejects an invalid dependency instrumentation value", async () => {
		vi.stubEnv(DEPENDENCIES_INSTRUMENTATION_ENV_VAR, "sometimes");
		const upload = mockWorkerUpload();
		await seedWorkerWithDependency();

		await expect(runCf(["deploy", "--prebuilt"])).rejects.toThrow(
			`Expected ${DEPENDENCIES_INSTRUMENTATION_ENV_VAR} to be "true" or "false", but got "sometimes"`
		);
		expect(upload.metadata).toBeUndefined();
	});

	it("sets keep_vars to false by default", async () => {
		const upload = mockWorkerUpload();

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(["deploy"]);

		expect(exitCode).toBe(0);
		expect(upload.metadata?.keep_bindings).not.toContain("plain_text");
		expect(upload.metadata?.keep_bindings).not.toContain("json");
	});

	it("includes keep_bindings in metadata for existing workers when secrets are present", async () => {
		mockExistingWorker();
		const upload = mockWorkerUpload();

		// Mock secrets endpoint to return existing secrets
		const { msw } = await import("../../helpers/msw.js");
		const { http, HttpResponse } = await import("msw");
		const { createFetchResult } = await import("../../helpers/msw.js");
		msw.use(
			http.get(
				"*/accounts/:accountId/workers/scripts/:scriptName/secrets",
				() =>
					HttpResponse.json(
						createFetchResult([{ name: "MY_SECRET", type: "secret_text" }])
					),
				{ once: true }
			)
		);

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				env: {
					MY_SECRET: { type: "secret" },
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(["deploy"]);

		expect(exitCode).toBe(0);
		// API-only secrets rely on this type-level inheritance.
		expect(upload.metadata?.keep_bindings).toContain("secret_text");
		// For existing workers with secrets, deploy-helpers adds inherit bindings
		const bindings = upload.metadata?.bindings as
			| Array<{ type: string; name: string }>
			| undefined;
		const secretBinding = bindings?.find((b) => b.name === "MY_SECRET");
		expect(secretBinding?.type).toBe("inherit");
	});
});
