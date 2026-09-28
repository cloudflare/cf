import { readFileSync } from "node:fs";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockDeployContext } from "../helpers/mock-deploy-context.js";
import { createFetchResult, msw, setupMsw } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";
import {
	ACCOUNT_ID,
	buildDelegateWasCalled,
	mockDefaultHandlers,
	mockExistingWorker,
	mockWorkerUpload,
	readBuildDelegateArgv,
	readDockerCommands,
	recordRequests,
	seedBuildDelegate,
	seedDockerMock,
	buildOutputRootConfig,
	workerConfig,
} from "./deploy/helpers.js";

vi.mock("../../lib/deploy-context.js", () => ({
	createDeployContext: (authToken: string) =>
		createMockDeployContext(authToken),
}));

describe("cf workers versions create", () => {
	setupMsw();
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		mockDefaultHandlers();
		mockExistingWorker({ lastDeployedFrom: "cf_cli" });
		await seedBuildDelegate();
	});

	it("builds, uploads a version, and passes bindings through", async () => {
		const upload = mockWorkerUpload();

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				compatibilityFlags: ["nodejs_compat"],
				env: {
					MY_KV: { type: "kv", id: "kv-ns-id-123" },
					MY_VAR: { type: "text", value: "hello" },
					MY_SECRET: { type: "secret" },
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(["workers", "versions", "create"]);

		expect(exitCode).toBe(0);

		// Build was invoked
		expect(buildDelegateWasCalled()).toBe(true);

		// Upload captured the metadata
		expect(upload.metadata?.main_module).toBe("index.js");
		expect(upload.metadata?.compatibility_date).toBe("2025-01-01");
		expect(upload.metadata?.compatibility_flags).toContain("nodejs_compat");
		expect(upload.modules).toContain("index.js");

		// Bindings passed through
		const bindings = upload.metadata?.bindings as
			| Array<{ type: string; name: string }>
			| undefined;
		const byName = Object.fromEntries(
			bindings?.map((b) => [b.name, b.type]) ?? []
		);
		expect(byName.MY_KV).toBe("kv_namespace");
		expect(byName.MY_VAR).toBe("plain_text");
		expect(byName.MY_SECRET).toBe("inherit");

		expect(std.out).toContain("Uploaded test-worker");
	});

	it("runs build and forwards --mode", async () => {
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

		const { exitCode } = await runCf([
			"workers",
			"versions",
			"create",
			"--mode",
			"staging",
		]);

		expect(exitCode).toBe(0);
		expect(readBuildDelegateArgv()).toEqual(["build", "--mode", "staging"]);
	});

	it("validates mode when uploading prebuilt output", async () => {
		const upload = mockWorkerUpload();
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: false, mode: "production" },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		await expect(
			runCf([
				"workers",
				"versions",
				"create",
				"--prebuilt",
				"--mode",
				"staging",
			])
		).rejects.toThrow(
			'The Build Output was created with mode "production", but this command requested mode "staging". To use the existing Build Output, rerun with "--mode production". To deploy in staging mode, rebuild with "--mode staging" before deploying.'
		);

		expect(buildDelegateWasCalled()).toBe(false);
		expect(upload.metadata).toBeUndefined();
	});

	it("requires the recorded mode when uploading prebuilt output", async () => {
		const upload = mockWorkerUpload();
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: false, mode: "staging" },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		await expect(
			runCf(["workers", "versions", "create", "--prebuilt"])
		).rejects.toThrow(
			'The Build Output was created with mode "staging", but this command did not specify a mode. Rerun with "--mode staging".'
		);

		expect(buildDelegateWasCalled()).toBe(false);
		expect(upload.metadata).toBeUndefined();
	});

	it("points Preview Build Output to a mode-aware Preview deploy", async () => {
		const upload = mockWorkerUpload();
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: true, mode: "staging" },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		await expect(
			runCf(["workers", "versions", "create", "--prebuilt"])
		).rejects.toThrow(
			"Run cf previews deploy --prebuilt --mode staging instead"
		);

		expect(buildDelegateWasCalled()).toBe(false);
		expect(upload.metadata).toBeUndefined();
	});

	it("passes --preview-alias through to the version upload", async () => {
		const upload = mockWorkerUpload();
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf([
			"workers",
			"versions",
			"create",
			"--preview-alias",
			"my-alias",
		]);

		expect(exitCode).toBe(0);
		const annotations = upload.metadata?.annotations as
			| Record<string, string>
			| undefined;
		expect(annotations?.["workers/alias"]).toBe("my-alias");
	});

	it("skips build when --prebuilt is passed", async () => {
		mockWorkerUpload();
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf([
			"workers",
			"versions",
			"create",
			"--prebuilt",
		]);

		expect(exitCode).toBe(0);
		expect(buildDelegateWasCalled()).toBe(false);
	});

	it("makes no API requests and needs no credentials during a dry run", async () => {
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

		const { exitCode } = await runCf([
			"workers",
			"versions",
			"create",
			"--prebuilt",
			"--dry-run",
		]);

		expect(exitCode).toBe(0);
		expect(requests).toEqual([]);
		expect(std.out).toContain("--dry-run: exiting now.");
	});

	it("uploads a version of the Worker selected by --worker", async () => {
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

		const { exitCode } = await runCf([
			"workers",
			"versions",
			"create",
			"--prebuilt",
			"--worker",
			"api",
		]);

		expect(exitCode).toBe(0);
		expect(upload.scriptName).toBe("api");
		expect(upload.metadata?.main_module).toBe("api.js");
		expect(upload.modules).toEqual(["api.js"]);
	});

	it("uploads Durable Object-managed Container images with the version", async () => {
		vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());
		const upload = mockWorkerUpload();
		const digest = `sha256:${"b".repeat(64)}`;
		const preparedImage = `registry.cloudflare.com/${ACCOUNT_ID}/tools@${digest}`;
		const imagePreparations: unknown[] = [];
		let applicationRequests = 0;
		msw.use(
			http.post("*/image-preparations", async ({ request }) => {
				imagePreparations.push(await request.json());
				return HttpResponse.json(
					createFetchResult({ image: preparedImage, status: "ready" })
				);
			}),
			http.post("*/containers/applications", () => {
				applicationRequests++;
				return HttpResponse.json(createFetchResult({}));
			})
		);

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				exports: {
					SessionDO: {
						type: "durable-object",
						storage: "sqlite",
						container: "sessions",
					},
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export class SessionDO {}; export default {};",
			".cloudflare/output/v0/containers/sessions/container.config.json":
				JSON.stringify({
					name: "sessions",
					schedulingPolicy: "durable-object",
					images: { tools: { reference: preparedImage } },
				}),
		});

		const { exitCode } = await runCf([
			"workers",
			"versions",
			"create",
			"--prebuilt",
		]);

		expect(exitCode).toBe(0);
		expect(imagePreparations).toEqual([{ image: preparedImage }]);
		expect(upload.metadata?.containers).toEqual([
			{
				name: "sessions",
				class_name: "SessionDO",
				images: { tools: preparedImage },
			},
		]);
		expect(readDockerCommands()).toEqual([]);
		// Declarative exports are reconciled only when this version is deployed.
		expect(applicationRequests).toBe(0);
	});

	it("pushes an already-built local Durable Object Container image with the version", async () => {
		const upload = mockWorkerUpload();
		vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());
		const pushedImage = `registry.cloudflare.com/${ACCOUNT_ID}/sessions-tools@sha256:${"d".repeat(64)}`;
		const imagePreparations: unknown[] = [];
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
			http.post("*/image-preparations", async ({ request }) => {
				const body = (await request.json()) as { image: string };
				imagePreparations.push(body);
				return HttpResponse.json(
					createFetchResult({ image: body.image, status: "ready" })
				);
			})
		);

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				exports: {
					SessionDO: {
						type: "durable-object",
						storage: "sqlite",
						container: "sessions",
					},
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export class SessionDO {}; export default {};",
			".cloudflare/output/v0/containers/sessions/container.config.json":
				JSON.stringify({
					name: "sessions",
					schedulingPolicy: "durable-object",
					images: { tools: { localReference: "sessions-tools:built-by-vite" } },
				}),
		});

		const { exitCode } = await runCf([
			"workers",
			"versions",
			"create",
			"--prebuilt",
		]);

		expect(exitCode).toBe(0);
		const dockerCommands = readDockerCommands();
		expect(dockerCommands).toContain(
			"image inspect sessions-tools:built-by-vite --format {{ json .RepoDigests }}"
		);
		expect(dockerCommands).toContain(
			`tag sessions-tools:built-by-vite registry.cloudflare.com/${ACCOUNT_ID}/sessions-tools:built-by-vite`
		);
		expect(dockerCommands).toContain(
			`push registry.cloudflare.com/${ACCOUNT_ID}/sessions-tools:built-by-vite`
		);
		expect(dockerCommands).toContain("image rm sessions-tools:built-by-vite");
		expect(imagePreparations).toEqual([{ image: pushedImage }]);
		expect(upload.metadata?.containers).toEqual([
			{
				name: "sessions",
				class_name: "SessionDO",
				images: { tools: pushedImage },
			},
		]);
	});

	it("retains a local Durable Object Container image when version upload fails", async () => {
		mockWorkerUpload();
		vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());
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
			http.post("*/image-preparations", async ({ request }) => {
				const body = (await request.json()) as { image: string };
				return HttpResponse.json(
					createFetchResult({ image: body.image, status: "ready" })
				);
			}),
			http.post(
				"*/accounts/:accountId/workers/scripts/:scriptName/versions",
				() =>
					HttpResponse.json(
						createFetchResult(null, false, [
							{ code: 1000, message: "version upload failed" },
						]),
						{ status: 500 }
					)
			)
		);

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				exports: {
					SessionDO: {
						type: "durable-object",
						storage: "sqlite",
						container: "sessions",
					},
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export class SessionDO {}; export default {};",
			".cloudflare/output/v0/containers/sessions/container.config.json":
				JSON.stringify({
					name: "sessions",
					schedulingPolicy: "durable-object",
					images: { tools: { localReference: "sessions-tools:built-by-vite" } },
				}),
		});

		await expect(
			runCf(["workers", "versions", "create", "--prebuilt"])
		).rejects.toThrow();
		const dockerCommands = readDockerCommands();
		expect(dockerCommands).toContain(
			`push registry.cloudflare.com/${ACCOUNT_ID}/sessions-tools:built-by-vite`
		);
		expect(dockerCommands).not.toContain(
			"image rm sessions-tools:built-by-vite"
		);
	});

	it("does not remove standard Container images during version upload", async () => {
		const upload = mockWorkerUpload();
		vi.stubEnv("WRANGLER_DOCKER_BIN", await seedDockerMock());
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
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
					image: { localReference: "api-container:built-by-vite" },
					maxInstances: 1,
				}),
		});

		const { exitCode } = await runCf([
			"workers",
			"versions",
			"create",
			"--prebuilt",
		]);

		expect(exitCode).toBe(0);
		expect(upload.metadata?.containers).toEqual([
			{ name: "api-container", class_name: "ContainerDO" },
		]);
		expect(readDockerCommands()).toEqual([]);
	});
});

describe("cf workers versions create — metadata guard", () => {
	function readJson<T>(relative: string): T {
		return JSON.parse(
			readFileSync(new URL(relative, import.meta.url), "utf-8")
		) as T;
	}

	const schemas = readJson<{ schemas: Record<string, unknown> }>(
		"../../commands/_generated/_meta/schemas.json"
	).schemas;

	it("publishes the project workflow without raw API identity", () => {
		const entry = readJson<{
			commands: {
				command: string;
				name: string;
				fullPath: string[];
				category: string;
				usage: string;
				apiPath?: string;
				httpMethod?: string;
				operationId?: string;
				hasRequestBody?: boolean;
			}[];
		}>("../../commands/_generated/_meta/commands.json").commands.find(
			(command) => command.command === "cf workers versions create"
		);

		expect(schemas["workers versions create"]).toBeUndefined();
		expect(entry).toMatchObject({
			command: "cf workers versions create",
			name: "create",
			fullPath: ["workers", "versions", "create"],
			category: "create",
			usage: "cf workers versions create [options]",
		});
		expect(entry).not.toHaveProperty("apiPath");
		expect(entry).not.toHaveProperty("httpMethod");
		expect(entry).not.toHaveProperty("operationId");
		expect(entry).not.toHaveProperty("hasRequestBody");
		expect(
			readJson<{ commands: { command: string }[] }>(
				"../../commands/_generated/_meta/commands.json"
			).commands.some(
				(command) => command.command === "cf workers versions upload"
			)
		).toBe(false);
	});
});
