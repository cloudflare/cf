import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockDeployContext } from "../../helpers/mock-deploy-context.js";
import { createFetchResult, msw, setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";
import {
	ACCOUNT_ID,
	mockDefaultHandlers,
	mockWorkerUpload,
	seedBuildDelegate,
	buildOutputRootConfig,
	workerConfig,
} from "./helpers.js";

vi.mock("../../../lib/deploy-context.js", () => ({
	createDeployContext: (authToken: string) =>
		createMockDeployContext(authToken),
}));

describe("cf deploy — error handling", () => {
	setupMsw();
	runInTempDir();
	mockConsoleMethods();

	beforeEach(async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		mockDefaultHandlers();
		await seedBuildDelegate();
	});

	it("surfaces auth errors from the services check", async () => {
		// Override services check to return 401
		msw.use(
			http.get(
				"*/accounts/:accountId/workers/services/:scriptName",
				() =>
					HttpResponse.json(
						createFetchResult(null, false, [
							{ code: 10000, message: "Authentication error" },
						]),
						{ status: 401 }
					),
				{ once: true }
			)
		);
		mockWorkerUpload();

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		await expect(runCf(["deploy"])).rejects.toThrow();
	});

	it("fails when upload returns an API error", async () => {
		// Override upload to return an error
		msw.use(
			http.put(
				"*/accounts/:accountId/workers/scripts/:scriptName",
				() =>
					HttpResponse.json(
						createFetchResult(null, false, [
							{
								code: 10021,
								message: "Script too large",
							},
						]),
						{ status: 400 }
					),
				{ once: true }
			)
		);

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		await expect(runCf(["deploy"])).rejects.toThrow();
	});

	it("fails when no build output exists", async () => {
		// Don't seed any build output
		await expect(runCf(["deploy"])).rejects.toThrow(/No root config found/i);
	});
});
