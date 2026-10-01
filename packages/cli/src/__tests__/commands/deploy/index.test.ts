import { existsSync, readFileSync } from "node:fs";
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
	buildDelegateWasCalled,
	captureDeployment,
	mockDefaultHandlers,
	mockExistingWorker,
	mockWorkerUpload,
	readBuildDelegateArgv,
	readBuildDelegateEnvironment,
	recordRequests,
	readDockerCommands,
	seedBuildDelegate,
	seedDockerMock,
	buildOutputRootConfig,
	workerConfig,
} from "./helpers.js";

vi.mock("../../../lib/deploy-context.js", () => ({
	createDeployContext: (authToken: string) =>
		createMockDeployContext(authToken),
}));

describe("cf deploy", () => {
	setupMsw();
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		mockDefaultHandlers();
		await seedBuildDelegate();
	});

	describe("simple worker", () => {
		it("loads dotenv values after the delegated build", async () => {
			vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
			vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
			let valueDuringApiRequest: string | undefined;
			let authorizationDuringApiRequest: string | null = null;
			mockWorkerUpload(
				{},
				{
					onRequest: (request) => {
						valueDuringApiRequest = process.env.CLOUDFLARE_ACCOUNT_ID;
						authorizationDuringApiRequest =
							request.headers.get("authorization");
					},
				}
			);
			await seed({
				".env": [
					"CLOUDFLARE_API_TOKEN=file-token",
					`CLOUDFLARE_ACCOUNT_ID=${ACCOUNT_ID}`,
				].join("\n"),
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf(["deploy"]);

			expect(exitCode).toBe(0);
			expect(readBuildDelegateEnvironment()).toBe("");
			expect(valueDuringApiRequest).toBe(ACCOUNT_ID);
			expect(authorizationDuringApiRequest).toBe("Bearer file-token");
			expect(process.env.CLOUDFLARE_ACCOUNT_ID).toBeUndefined();
		});

		it("deploys a single ESM module", async () => {
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
			expect(upload.metadata?.main_module).toBe("index.js");
			expect(upload.metadata?.compatibility_date).toBe("2025-01-01");
			expect(upload.modules).toContain("index.js");
			expect(std.out).toContain("Deployed");
			expect(std.out).toContain("test-worker");
		});

		it("deploys a standard Container from Build Output", async () => {
			vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());
			const upload = mockWorkerUpload();
			let application: Record<string, unknown> | undefined;
			msw.use(
				http.get(
					"*/accounts/:accountId/workers/durable_objects/namespaces",
					() =>
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
				http.get("*/accounts/:accountId/containers/me", () =>
					HttpResponse.json(
						createFetchResult({
							external_account_id: ACCOUNT_ID,
							limits: { disk_mb_per_deployment: 2000 },
						})
					)
				),
				http.post(
					"*/accounts/:accountId/containers/applications",
					async ({ request }) => {
						application = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json(createFetchResult(application));
					}
				)
			);

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						exports: {
							ContainerDO: {
								type: "durable-object",
								storage: "sqlite",
								container: "api-container",
							},
						},
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export class ContainerDO {}; export default {};",
				".cloudflare/output/v0/containers/api/container.config.json":
					JSON.stringify({
						name: "api-container",
						image: { reference: "registry.cloudflare.com/api:latest" },
						maxInstances: 2,
					}),
			});

			const { exitCode } = await runCf(["deploy", "--prebuilt"]);

			expect(exitCode).toBe(0);
			expect(upload.metadata?.containers).toEqual([
				{ name: "api-container", class_name: "ContainerDO" },
			]);
			expect(application).toMatchObject({
				name: "api-container",
				max_instances: 2,
				durable_objects: { namespace_id: "namespace-id" },
			});
			expect(readDockerCommands()).toEqual([]);
		});

		it("pushes an already-built local Container image from Build Output", async () => {
			const upload = mockWorkerUpload();
			vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());
			let application: Record<string, unknown> | undefined;
			let registryCredentialUrl: string | undefined;
			msw.use(
				http.get(
					"*/accounts/:accountId/workers/durable_objects/namespaces",
					() =>
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
				http.get("*/accounts/:accountId/containers/me", () =>
					HttpResponse.json(
						createFetchResult({
							external_account_id: ACCOUNT_ID,
							limits: { disk_mb_per_deployment: 2000 },
						})
					)
				),
				http.post("*/registries/:domain/credentials", ({ request }) => {
					registryCredentialUrl = request.url;
					return HttpResponse.json(
						createFetchResult({
							account_id: ACCOUNT_ID,
							registry_host: "registry.cloudflare.com",
							username: "v1",
							password: "test-password",
						})
					);
				}),
				http.post(
					"*/accounts/:accountId/containers/applications",
					async ({ request }) => {
						application = (await request.json()) as Record<string, unknown>;
						return HttpResponse.json(createFetchResult(application));
					}
				)
			);

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig({
					complianceRegion: "fedramp-high",
				}),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						exports: {
							ContainerDO: {
								type: "durable-object",
								storage: "sqlite",
								container: "api-container",
							},
						},
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export class ContainerDO {}; export default {};",
				".cloudflare/output/v0/containers/api/container.config.json":
					JSON.stringify({
						name: "api-container",
						image: { localReference: "api-container:built-by-wrangler" },
						maxInstances: 2,
					}),
			});

			const { exitCode } = await runCf(["deploy", "--prebuilt"]);

			expect(exitCode).toBe(0);
			expect(upload.metadata?.containers).toEqual([
				{ name: "api-container", class_name: "ContainerDO" },
			]);
			const dockerCommands = readDockerCommands();
			expect(dockerCommands).toContain(
				"image inspect api-container:built-by-wrangler --format {{ json .RepoDigests }}"
			);
			expect(dockerCommands).toContain(
				`tag api-container:built-by-wrangler registry.fed.cloudflare.com/${ACCOUNT_ID}/api-container:test`
			);
			expect(dockerCommands).toContain(
				`push registry.fed.cloudflare.com/${ACCOUNT_ID}/api-container:test`
			);
			expect(dockerCommands).toContain(
				"image rm api-container:built-by-wrangler"
			);
			expect(registryCredentialUrl).toMatch(
				/^https:\/\/api\.fed\.cloudflare\.com\/client\/v4\//
			);
			expect(application).toMatchObject({
				name: "api-container",
				configuration: {
					image: `registry.fed.cloudflare.com/${ACCOUNT_ID}/api-container@sha256:${"d".repeat(64)}`,
				},
			});
		});

		it("retains a local Container image when its registry push fails", async () => {
			mockWorkerUpload();
			vi.stubEnv(
				"WRANGLER_DOCKER_BIN",
				await seedDockerMock({ failPush: true })
			);
			msw.use(
				http.get(
					"*/accounts/:accountId/workers/durable_objects/namespaces",
					() =>
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
				)
			);

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						exports: {
							ContainerDO: {
								type: "durable-object",
								storage: "sqlite",
								container: "api-container",
							},
						},
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export class ContainerDO {}; export default {};",
				".cloudflare/output/v0/containers/api/container.config.json":
					JSON.stringify({
						name: "api-container",
						image: { localReference: "api-container:built-by-vite" },
						maxInstances: 1,
					}),
			});

			await expect(runCf(["deploy", "--prebuilt"])).rejects.toThrow();
			const dockerCommands = readDockerCommands();
			expect(dockerCommands).toContain(
				`tag api-container:built-by-vite registry.cloudflare.com/${ACCOUNT_ID}/api-container:test`
			);
			expect(dockerCommands).toContain(
				`push registry.cloudflare.com/${ACCOUNT_ID}/api-container:test`
			);
			expect(dockerCommands).not.toContain(
				"image rm api-container:built-by-vite"
			);
		});

		it.each([
			{ condition: "after pushing it", remoteImageExists: false },
			{ condition: "when it already exists remotely", remoteImageExists: true },
		])(
			"retains a local Container image $condition when application deployment fails",
			async ({ remoteImageExists }) => {
				mockWorkerUpload();
				vi.stubEnv(
					"WRANGLER_DOCKER_BIN",
					await seedDockerMock({ remoteImageExists })
				);
				msw.use(
					http.get(
						"*/accounts/:accountId/workers/durable_objects/namespaces",
						() =>
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
					http.post("*/accounts/:accountId/containers/applications", () =>
						HttpResponse.json(
							createFetchResult(null, false, [
								{ code: 1000, message: "application deployment failed" },
							]),
							{ status: 500 }
						)
					)
				);

				await seed({
					".cloudflare/output/v0/config.json": buildOutputRootConfig(),
					".cloudflare/output/v0/workers/default/worker.config.json":
						workerConfig({
							exports: {
								ContainerDO: {
									type: "durable-object",
									storage: "sqlite",
									container: "api-container",
								},
							},
						}),
					".cloudflare/output/v0/workers/default/bundle/index.js":
						"export class ContainerDO {}; export default {};",
					".cloudflare/output/v0/containers/api/container.config.json":
						JSON.stringify({
							name: "api-container",
							image: { localReference: "api-container:built-by-vite" },
							maxInstances: 1,
						}),
				});

				await expect(runCf(["deploy", "--prebuilt"])).rejects.toThrow();
				const dockerCommands = readDockerCommands();
				if (remoteImageExists) {
					expect(dockerCommands).not.toContain(
						`push registry.cloudflare.com/${ACCOUNT_ID}/api-container:test`
					);
				} else {
					expect(dockerCommands).toContain(
						`push registry.cloudflare.com/${ACCOUNT_ID}/api-container:test`
					);
				}
				expect(dockerCommands).not.toContain(
					"image rm api-container:built-by-vite"
				);
			}
		);

		it("retains a local Container image when the Worker upload fails", async () => {
			vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());
			mockWorkerUpload();
			msw.use(
				http.put("*/accounts/:accountId/workers/scripts/:scriptName", () =>
					HttpResponse.json(
						createFetchResult(null, false, [
							{ code: 1000, message: "upload failed" },
						]),
						{ status: 500 }
					)
				)
			);

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						exports: {
							ContainerDO: {
								type: "durable-object",
								storage: "sqlite",
								container: "api-container",
							},
						},
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export class ContainerDO {}; export default {};",
				".cloudflare/output/v0/containers/api/container.config.json":
					JSON.stringify({
						name: "api-container",
						image: { localReference: "api-container:built-by-vite" },
						maxInstances: 1,
					}),
			});

			await expect(runCf(["deploy", "--prebuilt"])).rejects.toThrow(
				"A request to the Cloudflare API"
			);
			expect(readDockerCommands()).toEqual([]);
		});

		it("preserves Container metadata without applying it for --containers-rollout=none", async () => {
			const upload = mockWorkerUpload();
			vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());
			let applicationRequests = 0;
			msw.use(
				http.all("*/accounts/:accountId/containers/applications", () => {
					applicationRequests++;
					return HttpResponse.json(createFetchResult([]));
				})
			);

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						exports: {
							ContainerDO: {
								type: "durable-object",
								storage: "sqlite",
								container: "api-container",
							},
						},
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export class ContainerDO {}; export default {};",
				".cloudflare/output/v0/containers/api/container.config.json":
					JSON.stringify({
						name: "api-container",
						image: { localReference: "api-container:built-by-vite" },
						maxInstances: 2,
					}),
			});

			const { exitCode } = await runCf([
				"deploy",
				"--prebuilt",
				"--containers-rollout=none",
			]);

			expect(exitCode).toBe(0);
			expect(upload.metadata?.containers).toEqual([
				{ name: "api-container", class_name: "ContainerDO" },
			]);
			expect(applicationRequests).toBe(0);
			expect(readDockerCommands()).toEqual([]);
		});

		it("runs build before deploying and forwards mode", async () => {
			mockWorkerUpload();
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig({
					buildContext: { isPreview: false, mode: "staging" },
				}),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf(["deploy", "--mode", "staging"]);

			expect(exitCode).toBe(0);
			expect(readBuildDelegateArgv()).toEqual(["build", "--mode", "staging"]);
		});

		it("rejects build output produced for a different mode before API requests", async () => {
			let apiRequestCalled = false;
			msw.use(
				http.all("*", () => {
					apiRequestCalled = true;
					return HttpResponse.json(createFetchResult({}));
				})
			);
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig({
					buildContext: { isPreview: false, mode: "production" },
				}),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			await expect(runCf(["deploy", "--mode", "staging"])).rejects.toThrow(
				'The Build Output was created with mode "production", but this command requested mode "staging". To use the existing Build Output, rerun with "--mode production". To deploy in staging mode, rebuild with "--mode staging" before deploying.'
			);

			expect(readBuildDelegateArgv()).toEqual(["build", "--mode", "staging"]);
			expect(apiRequestCalled).toBe(false);
		});

		it("skips build when --prebuilt is passed", async () => {
			const requests = recordRequests();
			mockWorkerUpload();
			await seed({
				"cloudflare.config.ts": `export default () => { throw new Error("Project config should not be reevaluated"); };`,
				".cloudflare/output/v0/config.json": buildOutputRootConfig({
					accountId: "built-account",
					complianceRegion: "fedramp-high",
				}),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf(["deploy", "--prebuilt"]);

			expect(exitCode).toBe(0);
			expect(buildDelegateWasCalled()).toBe(false);
			expect(
				requests.some((request) => request.includes("/accounts/built-account/"))
			).toBe(true);
		});

		it("selects an account without rereading config when output omits it", async () => {
			vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "env-account");
			const requests = recordRequests();
			const upload = mockWorkerUpload();
			await seed({
				"cloudflare.config.ts": `export default () => { throw new Error("Project config should not be reevaluated"); };`,
				".cloudflare/output/v0/config.json": buildOutputRootConfig({
					complianceRegion: "fedramp-high",
					buildContext: { isPreview: false, mode: "staging" },
				}),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf(["deploy", "--prebuilt"]);

			expect(exitCode).toBe(0);
			expect(buildDelegateWasCalled()).toBe(false);
			expect(upload.metadata?.main_module).toBe("index.js");
			expect(
				requests.some((request) => request.includes("/accounts/env-account/"))
			).toBe(true);
		});

		it("rejects Preview Build Output", async () => {
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig({
					buildContext: { isPreview: true, mode: "staging" },
				}),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			await expect(runCf(["deploy", "--prebuilt"])).rejects.toThrow(
				"Run cf previews deploy --prebuilt --mode staging instead"
			);
		});

		it("deploys the Worker selected by --worker", async () => {
			const upload = mockWorkerUpload();
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
				".cloudflare/output/v0/workers/api/worker.config.json": workerConfig({
					name: "api",
					mainModule: "api.js",
					modules: { "api.js": { type: "esm" } },
				}),
				".cloudflare/output/v0/workers/api/bundle/api.js":
					"export default { fetch() { return new Response('api'); } }",
			});

			const { exitCode } = await runCf(["deploy", "--worker", "api"]);

			expect(exitCode).toBe(0);
			expect(upload.scriptName).toBe("api");
			expect(upload.metadata?.main_module).toBe("api.js");
			expect(upload.modules).toEqual(["api.js"]);
		});

		it("deploys only the Containers referenced by the selected Worker", async () => {
			vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());
			const upload = mockWorkerUpload();
			const applications: Record<string, unknown>[] = [];
			msw.use(
				http.get(
					"*/accounts/:accountId/workers/durable_objects/namespaces",
					() =>
						HttpResponse.json(
							createFetchResult([
								{
									id: "namespace-id",
									class: "ApiContainer",
									script: "api",
									use_sqlite: true,
								},
							])
						)
				),
				http.get("*/accounts/:accountId/containers/applications", () =>
					HttpResponse.json(createFetchResult([]))
				),
				http.get("*/accounts/:accountId/containers/me", () =>
					HttpResponse.json(
						createFetchResult({
							external_account_id: ACCOUNT_ID,
							limits: { disk_mb_per_deployment: 2000 },
						})
					)
				),
				http.post(
					"*/accounts/:accountId/containers/applications",
					async ({ request }) => {
						const application = (await request.json()) as Record<
							string,
							unknown
						>;
						applications.push(application);
						return HttpResponse.json(createFetchResult(application));
					}
				)
			);
			const containerExport = (container: string) => ({
				type: "durable-object",
				storage: "sqlite",
				container,
			});
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						exports: { WebContainer: containerExport("web-container") },
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export class WebContainer {}; export default {};",
				".cloudflare/output/v0/workers/api/worker.config.json": workerConfig({
					name: "api",
					exports: { ApiContainer: containerExport("api-container") },
				}),
				".cloudflare/output/v0/workers/api/bundle/index.js":
					"export class ApiContainer {}; export default {};",
				".cloudflare/output/v0/containers/web/container.config.json":
					JSON.stringify({
						name: "web-container",
						image: { reference: "registry.cloudflare.com/web:latest" },
					}),
				".cloudflare/output/v0/containers/api/container.config.json":
					JSON.stringify({
						name: "api-container",
						image: { reference: "registry.cloudflare.com/api:latest" },
					}),
			});

			const { exitCode } = await runCf([
				"deploy",
				"--prebuilt",
				"--worker",
				"api",
			]);

			expect(exitCode).toBe(0);
			expect(upload.scriptName).toBe("api");
			expect(upload.metadata?.containers).toEqual([
				{ name: "api-container", class_name: "ApiContainer" },
			]);
			expect(applications).toEqual([
				expect.objectContaining({
					name: "api-container",
					durable_objects: { namespace_id: "namespace-id" },
				}),
			]);
		});

		it("rejects a repeated --worker", async () => {
			await expect(
				runCf(["deploy", "--prebuilt", "--worker", "api", "--worker", "web"])
			).rejects.toThrow("--worker can only be specified once.");
		});

		it("rejects an unknown --worker before API requests", async () => {
			let apiRequestCalled = false;
			msw.use(
				http.all("*", () => {
					apiRequestCalled = true;
					return HttpResponse.json(createFetchResult({}));
				})
			);
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			await expect(
				runCf(["deploy", "--prebuilt", "--worker", "missing"])
			).rejects.toThrow(
				'The Build Output has no Worker named "missing". Available Workers: test-worker (default).'
			);
			expect(apiRequestCalled).toBe(false);
		});

		it("deploys to a dispatch namespace", async () => {
			const upload = mockWorkerUpload({}, { dispatchNamespace: "test-ns" });
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf([
				"deploy",
				"--dispatch-namespace",
				"test-ns",
			]);

			expect(exitCode).toBe(0);
			expect(upload.metadata?.main_module).toBe("index.js");
			expect(upload.modules).toContain("index.js");
		});

		it("uploads secrets from a secrets file", async () => {
			const upload = mockWorkerUpload();
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
				"secrets.json": JSON.stringify({ API_TOKEN: "secret-value" }),
			});

			const { exitCode } = await runCf([
				"deploy",
				"--secrets-file",
				"secrets.json",
			]);

			expect(exitCode).toBe(0);
			const bindings = upload.metadata?.bindings as
				| Array<{ name: string; type: string }>
				| undefined;
			expect(bindings).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						name: "API_TOKEN",
						type: "secret_text",
					}),
				])
			);
		});
	});

	describe("multiple module types", () => {
		it("uploads all module types with correct mappings", async () => {
			const upload = mockWorkerUpload();
			const modules: Record<string, { type: string }> = {
				"index.js": { type: "esm" },
				"lib.cjs": { type: "cjs" },
				"data.bin": { type: "data" },
				"text.txt": { type: "text" },
				"helper.wasm": { type: "wasm" },
				"config.json": { type: "json" },
				"app.py": { type: "python" },
			};

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						modules,
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default {}",
				".cloudflare/output/v0/workers/default/bundle/lib.cjs":
					"module.exports = {}",
				".cloudflare/output/v0/workers/default/bundle/data.bin": "\x00\x01\x02",
				".cloudflare/output/v0/workers/default/bundle/text.txt": "hello",
				".cloudflare/output/v0/workers/default/bundle/helper.wasm":
					"wasm-bytes",
				".cloudflare/output/v0/workers/default/bundle/config.json":
					'{"key":"value"}',
				".cloudflare/output/v0/workers/default/bundle/app.py": "pass",
			});

			const { exitCode } = await runCf(["deploy"]);

			expect(exitCode).toBe(0);
			expect(upload.modules).toContain("index.js");
			expect(upload.modules).toContain("./lib.cjs");
			expect(upload.modules).toContain("./data.bin");
			expect(upload.modules).toContain("./text.txt");
			expect(upload.modules).toContain("./helper.wasm");
			expect(upload.modules).toContain("./config.json");
			expect(upload.modules).toContain("./app.py");
			expect(std.out).toContain("Deployed");
		});
	});

	describe("complex config with many bindings", () => {
		it("deploys a worker with many binding types and triggers", async () => {
			const upload = mockWorkerUpload();
			let schedulesBody: unknown;
			msw.use(
				http.put(
					"*/accounts/:accountId/workers/scripts/:scriptName/schedules",
					async ({ request }) => {
						schedulesBody = await request.json();
						return HttpResponse.json(createFetchResult({ schedules: [] }));
					},
					{ once: true }
				)
			);

			msw.use(
				http.get(
					"*/accounts/:accountId/queues",
					() =>
						HttpResponse.json(
							createFetchResult([
								{
									queue_id: "queue-id-123",
									queue_name: "my-queue",
								},
							])
						),
					{ once: false }
				),
				http.put(
					"*/accounts/:accountId/queues/:queueId/consumers",
					() => HttpResponse.json(createFetchResult({})),
					{ once: false }
				),
				http.post(
					"*/accounts/:accountId/queues/:queueId/consumers",
					() => HttpResponse.json(createFetchResult({})),
					{ once: false }
				),
				http.get(
					"*/accounts/:accountId/queues/:queueId/consumers",
					() => HttpResponse.json(createFetchResult([])),
					{ once: false }
				),
				http.get(
					"*/accounts/:accountId/workers/services/:scriptName",
					() =>
						HttpResponse.json(
							createFetchResult({
								id: "test-service-id",
								default_environment: {
									environment: "production",
									script: {
										tag: "existing-tag",
										last_deployed_from: "cf_cli",
									},
								},
							})
						),
					{ once: true }
				),
				http.get(
					"*/accounts/:accountId/workers/scripts/:scriptName/secrets",
					() =>
						HttpResponse.json(
							createFetchResult([{ name: "MY_SECRET", type: "secret_text" }])
						),
					{ once: true }
				),
				// Autoprovisioning probes whether the named R2 bucket already
				// exists; report that it does so it's deployed (connected) as-is
				// rather than provisioned.
				http.get(
					"*/accounts/:accountId/r2/buckets/:bucketName",
					({ params }) =>
						HttpResponse.json(
							createFetchResult({
								name: params.bucketName,
								creation_date: "2025-01-01T00:00:00.000Z",
							})
						),
					{ once: false }
				)
			);

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						compatibilityFlags: ["nodejs_compat"],
						env: {
							MY_KV: { type: "kv", id: "kv-ns-id-123" },
							MY_DB: {
								type: "d1",
								name: "my-d1",
								id: "d1-db-id-123",
							},
							MY_BUCKET: { type: "r2", name: "my-bucket" },
							MY_QUEUE: { type: "queue", name: "my-queue" },
							MY_DO: {
								type: "durable-object",
								worker: "do-worker",
								exportName: "MyDO",
							},
							MY_AI: { type: "ai" },
							MY_VEC: {
								type: "vectorize",
								name: "my-index",
							},
							MY_SECRET: { type: "secret" },
							MY_VAR: { type: "text", value: "hello" },
							MY_JSON: {
								type: "json",
								value: { key: "val" },
							},
							MY_SERVICE: {
								type: "worker",
								worker: "other-worker",
							},
							MY_AE: {
								type: "analytics-engine-dataset",
								name: "my-dataset",
							},
							MY_HYPER: {
								type: "hyperdrive",
								id: "hyper-config-id",
							},
						},
						triggers: [
							{ type: "scheduled", schedule: "*/5 * * * *" },
							{ type: "scheduled", schedule: "0 0 * * *" },
						],
						placement: { mode: "smart" },
						limits: { cpuMs: 50 },
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf(["deploy"]);

			expect(exitCode).toBe(0);

			const bindings = upload.metadata?.bindings as
				| Array<{ type: string; name: string }>
				| undefined;
			expect(bindings).toBeDefined();

			const byName = Object.fromEntries(
				// oxlint-disable-next-line typescript/no-non-null-assertion
				bindings!.map((b) => [b.name, b.type])
			);
			expect(byName.MY_KV).toBe("kv_namespace");
			expect(byName.MY_DB).toBe("d1");
			expect(byName.MY_BUCKET).toBe("r2_bucket");
			expect(byName.MY_QUEUE).toBe("queue");
			expect(byName.MY_DO).toBe("durable_object_namespace");
			expect(byName.MY_AI).toBe("ai");
			expect(byName.MY_VEC).toBe("vectorize");
			// For existing workers, secrets are inherited rather than re-sent
			expect(byName.MY_SECRET).toBe("inherit");
			expect(byName.MY_VAR).toBe("plain_text");
			expect(byName.MY_JSON).toBe("json");
			expect(byName.MY_SERVICE).toBe("service");
			expect(byName.MY_AE).toBe("analytics_engine");
			expect(byName.MY_HYPER).toBe("hyperdrive");

			expect(upload.metadata?.compatibility_flags).toContain("nodejs_compat");

			expect(schedulesBody).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ cron: "*/5 * * * *" }),
					expect.objectContaining({ cron: "0 0 * * *" }),
				])
			);

			expect(std.out).toContain("Deployed");
		});
	});

	describe("re-deploy existing worker", () => {
		it("aborts in strict mode when last deployed from api", async () => {
			const upload = mockWorkerUpload();
			vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());

			msw.use(
				http.get(
					"*/accounts/:accountId/workers/services/:scriptName",
					() =>
						HttpResponse.json(
							createFetchResult({
								id: "test-service-id",
								default_environment: {
									environment: "production",
									script: {
										tag: "existing-tag",
										last_deployed_from: "api",
									},
								},
							})
						),
					{ once: true }
				)
			);

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						exports: {
							ContainerDO: {
								type: "durable-object",
								storage: "sqlite",
								container: "api-container",
							},
						},
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export class ContainerDO {}; export default {};",
				".cloudflare/output/v0/containers/api/container.config.json":
					JSON.stringify({
						name: "api-container",
						image: { localReference: "api-container:built-by-vite" },
						maxInstances: 1,
					}),
			});

			await runCf(["deploy"]);

			// strict mode + non-interactive rejects the overwrite; no upload happens
			expect(upload.metadata).toBeUndefined();
			expect(std.err).toContain("Aborting");
			expect(readDockerCommands()).toEqual([]);
		});
	});

	describe("--dry-run", () => {
		it("previews setup without changing an existing Astro project or building", async () => {
			const packageJson = JSON.stringify({
				name: "astro-project",
				scripts: { deploy: "astro build && wrangler deploy" },
				dependencies: {
					astro: "7.3.5",
					"@astrojs/cloudflare": "14.3.3",
				},
				devDependencies: { cf: "1.0.0-beta.6", wrangler: "^4.142.0" },
			});
			const tsconfig = '{"include":["src/**/*"]}\n';
			const lockfile = "existing lockfile\n";
			const requests = recordRequests();
			await seed({
				"package.json": packageJson,
				"package-lock.json": lockfile,
				"tsconfig.json": tsconfig,
				"wrangler.jsonc": '{"name":"astro-project"}',
				"node_modules/astro/package.json": JSON.stringify({
					name: "astro",
					version: "7.3.5",
				}),
			});

			const { exitCode } = await runCf(["deploy", "--dry-run"]);

			expect(exitCode).toBe(0);
			expect(readFileSync("package.json", "utf8")).toBe(packageJson);
			expect(readFileSync("package-lock.json", "utf8")).toBe(lockfile);
			expect(readFileSync("tsconfig.json", "utf8")).toBe(tsconfig);
			expect(existsSync("public/.assetsignore")).toBe(false);
			expect(buildDelegateWasCalled()).toBe(false);
			expect(requests).toEqual([]);
			expect(std.out).toContain("Autoconfig process run in dry-run mode");
		});

		it("does not upload the worker", async () => {
			const upload = mockWorkerUpload();
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf(["deploy", "--dry-run"]);

			expect(exitCode).toBe(0);
			expect(upload.metadata).toBeUndefined();
			expect(std.out).toContain("--dry-run: exiting now.");
			expect(std.out).not.toContain("Deployed");
		});

		it("makes no API requests and needs no credentials", async () => {
			vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
			vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
			const requests = recordRequests();
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf(["deploy", "--prebuilt", "--dry-run"]);

			expect(exitCode).toBe(0);
			expect(requests).toEqual([]);
			expect(std.out).toContain("--dry-run: exiting now.");
		});

		it("does not remove local Container images", async () => {
			vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						exports: {
							ContainerDO: {
								type: "durable-object",
								storage: "sqlite",
								container: "api-container",
							},
						},
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export class ContainerDO {}; export default {};",
				".cloudflare/output/v0/containers/api/container.config.json":
					JSON.stringify({
						name: "api-container",
						image: { localReference: "api-container:built-by-vite" },
						maxInstances: 1,
					}),
			});

			const { exitCode } = await runCf(["deploy", "--prebuilt", "--dry-run"]);

			expect(exitCode).toBe(0);
			expect(readDockerCommands()).toEqual([]);
		});

		it("still runs the build step", async () => {
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf(["deploy", "--dry-run"]);

			expect(exitCode).toBe(0);
			expect(buildDelegateWasCalled()).toBe(true);
		});

		it("skips build with --prebuilt --dry-run", async () => {
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf(["deploy", "--prebuilt", "--dry-run"]);

			expect(exitCode).toBe(0);
			expect(buildDelegateWasCalled()).toBe(false);
			expect(std.out).toContain("--dry-run: exiting now.");
		});

		it("does not deploy triggers", async () => {
			const deployment = captureDeployment();
			let schedulesCalled = false;
			msw.use(
				http.put(
					"*/accounts/:accountId/workers/scripts/:scriptName/schedules",
					() => {
						schedulesCalled = true;
						return HttpResponse.json(createFetchResult({ schedules: [] }));
					},
					{ once: true }
				)
			);

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						triggers: [{ type: "scheduled", schedule: "*/5 * * * *" }],
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf(["deploy", "--dry-run"]);

			expect(exitCode).toBe(0);
			expect(deployment.called).toBe(false);
			expect(schedulesCalled).toBe(false);
			expect(std.out).toContain("--dry-run: exiting now.");
		});
	});

	describe("--tag and --message", () => {
		it("sends tag and message annotations in the version upload", async () => {
			const upload = mockWorkerUpload();
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf([
				"deploy",
				"--tag",
				"v1.0.0",
				"--message",
				"my deploy message",
			]);

			expect(exitCode).toBe(0);
			const annotations = upload.metadata?.annotations as
				| Record<string, string>
				| undefined;
			expect(annotations?.["workers/tag"]).toBe("v1.0.0");
			expect(annotations?.["workers/message"]).toBe("my deploy message");
		});

		it("sends deployment message annotation for existing workers", async () => {
			mockExistingWorker({ lastDeployedFrom: "cf_cli" });
			mockWorkerUpload();
			const deployment = captureDeployment();
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf([
				"deploy",
				"--message",
				"my deploy message",
			]);

			expect(exitCode).toBe(0);
			expect(deployment.called).toBe(true);
			const annotations = deployment.body?.annotations as
				| Record<string, string>
				| undefined;
			expect(annotations?.["workers/message"]).toBe("my deploy message");
		});

		it("does not set annotations when neither flag is provided", async () => {
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
			expect(upload.metadata?.annotations).toBeUndefined();
		});

		it("sends annotations via the versioned upload path for existing workers", async () => {
			mockExistingWorker({ lastDeployedFrom: "cf_cli" });
			const upload = mockWorkerUpload();
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			const { exitCode } = await runCf([
				"deploy",
				"--tag",
				"v2.0.0",
				"--message",
				"existing worker deploy",
			]);

			expect(exitCode).toBe(0);
			const annotations = upload.metadata?.annotations as
				| Record<string, string>
				| undefined;
			expect(annotations?.["workers/tag"]).toBe("v2.0.0");
			expect(annotations?.["workers/message"]).toBe("existing worker deploy");
		});
	});
});
