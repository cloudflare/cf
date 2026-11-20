import { readFileSync } from "node:fs";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createMockDeployContext } from "../../helpers/mock-deploy-context.js";
import { createFetchResult, msw, setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";
import {
	ACCOUNT_ID,
	buildOutputRootConfig,
	mockDefaultHandlers,
	mockExistingWorker,
	mockWorkerUpload,
	readDockerCommands,
	seedBuildDelegate,
	seedDockerMock,
	workerConfig,
} from "./helpers.js";

vi.mock("../../../lib/deploy-context.js", () => ({
	createDeployContext: (authToken: string) =>
		createMockDeployContext(authToken),
}));

describe("reusable Container Build Output", () => {
	setupMsw();
	runInTempDir();
	mockConsoleMethods();

	beforeEach(async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());
		await seedBuildDelegate();
		mockDefaultHandlers();
		msw.use(
			http.get("*/accounts/:accountId/containers/me", () =>
				HttpResponse.json(
					createFetchResult({
						external_account_id: ACCOUNT_ID,
						limits: { disk_mb_per_deployment: 2000 },
					})
				)
			),
			http.post("*/registries/:domain/credentials", () =>
				HttpResponse.json(
					createFetchResult({
						account_id: ACCOUNT_ID,
						registry_host: "registry.cloudflare.com",
						username: "v1",
						password: "test-password",
					})
				)
			),
			http.get("*/accounts/:accountId/workers/durable_objects/namespaces", () =>
				HttpResponse.json(
					createFetchResult([
						{
							id: "namespace-id",
							class: "ContainerDO",
							script: "test-worker",
							use_sqlite: true,
						},
					])
				)
			),
			http.get("*/accounts/:accountId/containers/applications", () =>
				HttpResponse.json(createFetchResult([]))
			),
			http.get(
				"*/accounts/:accountId/containers/applications/:applicationId",
				() =>
					HttpResponse.json(
						createFetchResult(null, false, [
							{ code: 1000, message: "Not found" },
						]),
						{ status: 404 }
					)
			),
			http.post(
				"*/accounts/:accountId/containers/applications",
				async ({ request }) =>
					HttpResponse.json(createFetchResult(await request.json()))
			),
			http.post("*/image-preparations", async ({ request }) =>
				HttpResponse.json(
					createFetchResult({
						...((await request.json()) as object),
						status: "ready",
					})
				)
			)
		);
	});

	it.each(
		[
			{
				workflow: "standard deploy",
				command: ["deploy"],
				durableObject: false,
			},
			{
				workflow: "Durable Object deploy",
				command: ["deploy"],
				durableObject: true,
			},
			{
				workflow: "Durable Object version upload",
				command: ["workers", "versions", "create"],
				durableObject: true,
			},
		].flatMap((scenario) => [
			{ ...scenario, prebuilt: true },
			{ ...scenario, prebuilt: false },
		])
	)(
		"reuses local images after $workflow (prebuilt=$prebuilt)",
		async ({ command, durableObject, prebuilt }) => {
			const localTag = "api-container:built-by-vite";
			const containerConfigPath =
				".cloudflare/output/v1/containers/api/container.config.json";
			const containerConfig = JSON.stringify(
				durableObject
					? {
							name: "api-container",
							schedulingPolicy: "durable-object",
							images: { app: { localReference: localTag } },
						}
					: {
							name: "api-container",
							image: { localReference: localTag },
							maxInstances: 2,
						}
			);
			await seed({
				".cloudflare/output/v1/config.json": buildOutputRootConfig(),
				".cloudflare/output/v1/workers/default/worker.config.json":
					workerConfig({
						exports: {
							ContainerDO: {
								type: "durable-object",
								storage: "sqlite",
								container: "api-container",
							},
						},
					}),
				".cloudflare/output/v1/workers/default/bundle/index.js":
					"export class ContainerDO {}; export default {};",
				[containerConfigPath]: containerConfig,
			});

			for (const flags of [prebuilt ? ["--prebuilt"] : [], ["--prebuilt"]]) {
				mockExistingWorker();
				const upload = mockWorkerUpload();
				expect(await runCf([...command, ...flags])).toEqual({ exitCode: 0 });
				expect(upload.metadata?.containers).toHaveLength(1);
				expect(readFileSync(containerConfigPath, "utf8")).toBe(containerConfig);
			}
			expect(readDockerCommands()).not.toContain(`image rm ${localTag}`);
		}
	);
});
