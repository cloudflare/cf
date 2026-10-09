import { getLogLevel } from "@cloudflare/cli-shared-helpers";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createMockDeployContext } from "../helpers/mock-deploy-context.js";
import { createFetchResult, msw, setupMsw } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";
import {
	ACCOUNT_ID,
	buildOutputRootConfig,
	readDockerCommands,
	seedDockerMock,
	workerConfig,
} from "./deploy/helpers.js";

vi.mock("../../lib/deploy-context.js", () => ({
	createDeployContext: (authToken: string) =>
		createMockDeployContext(authToken),
}));

async function runCapturingStdout<T>(task: () => Promise<T>) {
	const stdoutWrites: string[] = [];
	const stdoutWrite = vi
		.spyOn(process.stdout, "write")
		.mockImplementation((chunk) => {
			stdoutWrites.push(String(chunk));
			return true;
		});
	try {
		const result = await task();
		return { result, stdoutWrites: stdoutWrites.join("") };
	} finally {
		stdoutWrite.mockRestore();
	}
}

describe("cf previews deploy Containers", () => {
	setupMsw();
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
	});

	it("deploys only live Containers belonging to the selected Worker", async () => {
		let previewDeployment: Record<string, unknown> | undefined;
		let application: Record<string, unknown> | undefined;
		msw.use(
			http.get(
				"*/accounts/:accountId/workers/workers/:workerName/previews/:previewName",
				() =>
					HttpResponse.json(
						createFetchResult({
							id: "preview-id",
							name: "feature",
							slug: "feature",
							worker_name: "test-worker",
							created_on: "2026-09-23T00:00:00Z",
							updated_on: "2026-09-23T00:00:00Z",
						})
					)
			),
			http.get(
				"*/accounts/:accountId/workers/workers/:workerName/previews/:previewId/deployments/latest",
				() =>
					HttpResponse.json(createFetchResult({ id: "previous-deployment-id" }))
			),
			http.post(
				"*/accounts/:accountId/workers/workers/:workerName/previews/:previewId/deployments",
				async ({ request }) => {
					const form = await request.formData();
					const metadata = form.get("metadata");
					if (typeof metadata !== "string") {
						throw new Error("Expected Preview deployment metadata");
					}
					previewDeployment = JSON.parse(metadata) as Record<string, unknown>;
					return HttpResponse.json(
						createFetchResult({
							id: "deployment-id",
							preview_id: "preview-id",
							preview_name: "feature",
							created_on: "2026-09-23T00:00:00Z",
							env: {
								CONTAINER: {
									type: "durable_object_namespace",
									class_name: "ContainerDO",
									namespace_id: "preview-namespace-id",
								},
							},
						})
					);
				}
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
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: true },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				exports: {
					ContainerDO: {
						type: "durable-object",
						storage: "sqlite",
						container: "api-container",
					},
					DeletedDO: {
						type: "durable-object",
						state: "deleted",
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
			".cloudflare/output/v0/containers/other/container.config.json":
				JSON.stringify({
					name: "other-worker-container",
					image: { reference: "registry.cloudflare.com/other:latest" },
					maxInstances: 1,
				}),
			".cloudflare/output/v0/containers/deleted/container.config.json":
				JSON.stringify({
					name: "deleted-container",
					image: { reference: "registry.cloudflare.com/deleted:latest" },
					maxInstances: 1,
				}),
		});

		const { exitCode } = await runCf([
			"previews",
			"deploy",
			"feature",
			"--prebuilt",
		]);

		expect(exitCode).toBe(0);
		expect(previewDeployment).toMatchObject({
			exports: { ContainerDO: { type: "durable-object", storage: "sqlite" } },
			containers: [{ class_name: "ContainerDO" }],
		});
		expect(application).toMatchObject({
			name: "test-worker_feature_ContainerDO",
			max_instances: 2,
			configuration: {
				image: "registry.cloudflare.com/test-account-id/api:latest",
			},
			durable_objects: { namespace_id: "preview-namespace-id" },
		});
		expect(JSON.parse(std.out)).toMatchObject({
			type: "preview",
			preview_id: "preview-id",
			deployment_id: "deployment-id",
		});
	});

	it("pushes a local Build Output Container image before applying it", async () => {
		vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());
		let application: Record<string, unknown> | undefined;
		msw.use(
			http.get(
				"*/accounts/:accountId/workers/workers/:workerName/previews/:previewName",
				() =>
					HttpResponse.json(
						createFetchResult({
							id: "preview-id",
							name: "feature",
							slug: "feature",
							worker_name: "test-worker",
							created_on: "2026-09-23T00:00:00Z",
							updated_on: "2026-09-23T00:00:00Z",
						})
					)
			),
			http.get(
				"*/accounts/:accountId/workers/workers/:workerName/previews/:previewId/deployments/latest",
				() =>
					HttpResponse.json(createFetchResult({ id: "previous-deployment-id" }))
			),
			http.post(
				"*/accounts/:accountId/workers/workers/:workerName/previews/:previewId/deployments",
				() =>
					HttpResponse.json(
						createFetchResult({
							id: "deployment-id",
							preview_id: "preview-id",
							preview_name: "feature",
							created_on: "2026-09-23T00:00:00Z",
							env: {
								CONTAINER: {
									type: "durable_object_namespace",
									class_name: "ContainerDO",
									namespace_id: "preview-namespace-id",
								},
							},
						})
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
				buildContext: { isPreview: true },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
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

		const originalLogLevel = getLogLevel();
		const {
			result: { exitCode },
			stdoutWrites,
		} = await runCapturingStdout(() =>
			runCf(["previews", "deploy", "feature", "--prebuilt"])
		);

		expect(exitCode).toBe(0);
		expect(stdoutWrites).toBe("");
		expect(getLogLevel()).toBe(originalLogLevel);
		expect(JSON.parse(std.out)).toMatchObject({
			type: "preview",
			preview_id: "preview-id",
			deployment_id: "deployment-id",
		});
		expect(readDockerCommands()).toEqual(
			expect.arrayContaining([
				"image inspect api-container:built-by-wrangler --format {{ json .RepoDigests }}",
				`tag api-container:built-by-wrangler registry.cloudflare.com/${ACCOUNT_ID}/api-container:built-by-wrangler`,
				`push registry.cloudflare.com/${ACCOUNT_ID}/api-container:built-by-wrangler`,
			])
		);
		expect(readDockerCommands()).not.toContain(
			"image rm api-container:built-by-wrangler"
		);
		expect(application).toMatchObject({
			configuration: {
				image: `registry.cloudflare.com/${ACCOUNT_ID}/api-container@sha256:${"d".repeat(64)}`,
			},
			durable_objects: { namespace_id: "preview-namespace-id" },
		});

		msw.use(
			http.post("*/accounts/:accountId/containers/applications", () =>
				HttpResponse.json(
					{ success: false, errors: [{ code: 1000, message: "Apply failed" }] },
					{ status: 500 }
				)
			)
		);
		await expect(
			runCf(["previews", "deploy", "feature", "--prebuilt"])
		).rejects.toThrow();
		expect(getLogLevel()).toBe(originalLogLevel);
	});

	it("checks Container access before creating a Preview", async () => {
		let previewWrites = 0;
		let applicationRequests = 0;
		msw.use(
			http.get("*/accounts/:accountId/containers/applications", () => {
				applicationRequests++;
				return HttpResponse.json(
					{
						success: false,
						errors: [{ code: 10000, message: "Container access denied" }],
					},
					{ status: 403 }
				);
			}),
			http.get(
				"*/accounts/:accountId/workers/workers/:workerName/previews/:previewName",
				() => HttpResponse.json(createFetchResult({ id: "preview-id" }))
			),
			http.post(
				"*/accounts/:accountId/workers/workers/:workerName/previews",
				() => {
					previewWrites++;
					return HttpResponse.json(createFetchResult({ id: "preview-id" }));
				}
			),
			http.post(
				"*/accounts/:accountId/workers/workers/:workerName/previews/:previewId/deployments",
				() => {
					previewWrites++;
					return HttpResponse.json(createFetchResult({ id: "deployment-id" }));
				}
			)
		);

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: true },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
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

		await expect(
			runCf(["previews", "deploy", "feature", "--prebuilt"])
		).rejects.toThrow();
		expect(applicationRequests).toBe(1);
		expect(previewWrites).toBe(0);
	});

	it("rejects Durable Object-managed Containers before uploading a Preview", async () => {
		let previewRequests = 0;
		msw.use(
			http.get(
				"*/accounts/:accountId/workers/workers/:workerName/previews/:previewName",
				() => {
					previewRequests++;
					return HttpResponse.json(createFetchResult({ id: "preview-id" }));
				}
			)
		);

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: true },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
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
					schedulingPolicy: "durable-object",
					images: { app: { reference: "registry.cloudflare.com/api:latest" } },
				}),
		});

		await expect(
			runCf(["previews", "deploy", "feature", "--prebuilt"])
		).rejects.toThrow(
			'Preview deployments do not support Durable Object-managed Containers (schedulingPolicy: "durable-object").'
		);
		expect(previewRequests).toBe(0);
	});
});
