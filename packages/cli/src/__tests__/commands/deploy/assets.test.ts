import { existsSync, readFileSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { toValidWorkerName } from "@cloudflare/workers-utils";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { prepareStaticAssetsBuildOutput } from "../../../commands/deploy/static-assets.js";
import { createMockDeployContext } from "../../helpers/mock-deploy-context.js";
import { createFetchResult, msw, setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";
import {
	ACCOUNT_ID,
	buildDelegateWasCalled,
	mockAssetUpload,
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

describe("cf deploy — assets", () => {
	setupMsw();
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		mockDefaultHandlers();
		await seedBuildDelegate();
	});

	describe("assets only (no user worker)", () => {
		it("infers the Worker name when package.json is absent", async () => {
			const upload = mockWorkerUpload();
			mockAssetUpload();
			await unlink("package.json");
			await seed({ "public/index.html": "hello" });

			const { exitCode } = await runCf(["deploy", "public"]);

			expect(exitCode).toBe(0);
			expect(upload.scriptName).toBe(
				toValidWorkerName(basename(process.cwd()))
			);
			expect(buildDelegateWasCalled()).toBe(false);
		});

		it("deploys a prebuilt static directory without invoking project tooling", async () => {
			const upload = mockWorkerUpload();
			const assets = mockAssetUpload();

			await seed({
				"package.json": JSON.stringify({ name: "static-site" }),
				"public/index.html": "<html><body>direct</body></html>",
				"public/nested/style.css": "body { color: blue; }",
				".cloudflare/output/v0/workers/default/bundle/stale.js":
					"export default {};",
			});

			const { exitCode } = await runCf([
				"deploy",
				"public",
				"--mode",
				"production",
			]);

			expect(exitCode).toBe(0);
			expect(buildDelegateWasCalled()).toBe(false);
			expect(upload.scriptName).toBe("static-site");
			expect(upload.metadata?.main_module).toBeUndefined();
			expect(Object.keys(assets.manifest ?? {})).toEqual([
				"/index.html",
				"/nested/style.css",
			]);

			const outputRoot = resolve(".cloudflare/output/v0");
			const rootConfig = JSON.parse(
				readFileSync(resolve(outputRoot, "config.json"), "utf8")
			) as Record<string, unknown>;
			const generatedWorkerConfig = JSON.parse(
				readFileSync(
					resolve(outputRoot, "workers/default/worker.config.json"),
					"utf8"
				)
			) as Record<string, unknown>;
			expect(rootConfig).toEqual({
				buildContext: { isPreview: false, mode: "production" },
			});
			expect(generatedWorkerConfig).toMatchObject({ name: "static-site" });
			expect(generatedWorkerConfig).not.toHaveProperty("manifest");
			expect(existsSync(resolve(outputRoot, "workers/default/bundle"))).toBe(
				false
			);
			expect(
				readFileSync(
					resolve(outputRoot, "workers/default/assets/index.html"),
					"utf8"
				)
			).toContain("direct");
			expect(readFileSync(resolve("public/index.html"), "utf8")).toContain(
				"direct"
			);
		});

		it("deploys the project root without including .cloudflare", async () => {
			mockWorkerUpload();
			const assets = mockAssetUpload();
			await seed({
				"index.html": "root asset",
				".cloudflare/project-state.json": "not an asset",
				".cloudflare/output/v0/workers/default/bundle/stale.js":
					"export default {};",
			});

			const { exitCode } = await runCf(["deploy", "."]);

			expect(exitCode).toBe(0);
			expect(buildDelegateWasCalled()).toBe(false);
			const manifestPaths = Object.keys(assets.manifest ?? {});
			expect(manifestPaths).toContain("/index.html");
			expect(
				manifestPaths.some((assetPath) => assetPath.startsWith("/.cloudflare/"))
			).toBe(false);
			expect(
				existsSync(
					resolve(".cloudflare/output/v0/workers/default/assets/.cloudflare")
				)
			).toBe(false);
		});

		it("writes Preview Build Output for Preview deployment commands", async () => {
			await seed({ "public/index.html": "preview" });

			await expect(
				prepareStaticAssetsBuildOutput(
					{ directory: "public", mode: "staging" },
					{ isPreview: true }
				)
			).resolves.toBe(true);

			expect(
				JSON.parse(readFileSync(".cloudflare/output/v0/config.json", "utf8"))
			).toMatchObject({
				buildContext: { isPreview: true, mode: "staging" },
			});
			expect(buildDelegateWasCalled()).toBe(false);
		});

		it("suppresses static assets preparation output with --quiet", async () => {
			await seed({ "public/index.html": "quiet" });

			await expect(
				prepareStaticAssetsBuildOutput(
					{ directory: "public", quiet: true },
					{ isPreview: false }
				)
			).resolves.toBe(true);

			expect(std.err).toBe("");
		});

		it("uses an optional assets-only Worker config", async () => {
			const upload = mockWorkerUpload();
			mockAssetUpload();
			await seed({
				"package.json": JSON.stringify({ type: "module" }),
				"cloudflare.config.ts": `export default {
					accountId: "${ACCOUNT_ID}",
					worker: {
						name: "configured-static-site",
						compatibilityDate: "2026-01-01",
						assets: { htmlHandling: "none" }
					}
				};`,
				"public/index.html": "configured",
			});

			const { exitCode } = await runCf(["deploy", "public"]);

			expect(exitCode).toBe(0);
			expect(upload.scriptName).toBe("configured-static-site");
			expect(upload.metadata?.assets).toMatchObject({
				config: { html_handling: "none" },
			});
			expect(
				JSON.parse(
					readFileSync(
						".cloudflare/output/v0/workers/default/worker.config.json",
						"utf8"
					)
				)
			).toMatchObject({
				name: "configured-static-site",
				compatibilityDate: "2026-01-01",
				assets: { htmlHandling: "none" },
			});
			expect(
				JSON.parse(readFileSync(".cloudflare/output/v0/config.json", "utf8"))
			).toMatchObject({ accountId: ACCOUNT_ID });
			expect(buildDelegateWasCalled()).toBe(false);
		});

		it("rejects configured Containers before replacing Build Output", async () => {
			await seed({
				"package.json": JSON.stringify({ type: "module" }),
				"cloudflare.config.ts": `export default {
					containers: [{
						name: "server-side-container",
						image: { reference: "registry.cloudflare.com/app:latest" }
					}]
				};`,
				"public/index.html": "hello",
				".cloudflare/output/v0/config.json": "existing output",
			});

			await expect(runCf(["deploy", "public"])).rejects.toThrow(
				"configures Containers, so this is not an assets-only project"
			);
			expect(readFileSync(".cloudflare/output/v0/config.json", "utf8")).toBe(
				"existing output"
			);
			expect(buildDelegateWasCalled()).toBe(false);
		});

		it("rejects a configured Worker entrypoint before replacing Build Output", async () => {
			await seed({
				"package.json": JSON.stringify({ type: "module" }),
				"cloudflare.config.ts": `export default {
					worker: {
						name: "server-side-site",
						compatibilityDate: "2026-01-01",
						entrypoint: "src/index.ts"
					}
				};`,
				"public/index.html": "hello",
				".cloudflare/output/v0/config.json": "existing output",
			});

			await expect(runCf(["deploy", "public"])).rejects.toThrow(
				"configures a Worker entrypoint, so this is not an assets-only project"
			);
			expect(readFileSync(".cloudflare/output/v0/config.json", "utf8")).toBe(
				"existing output"
			);
			expect(buildDelegateWasCalled()).toBe(false);
		});

		it("validates the static directory before replacing Build Output", async () => {
			await seed({
				".cloudflare/output/v0/config.json": "existing output",
			});

			await expect(runCf(["deploy", "missing"])).rejects.toThrow(
				"Static assets directory not found: missing"
			);
			expect(readFileSync(".cloudflare/output/v0/config.json", "utf8")).toBe(
				"existing output"
			);
			expect(buildDelegateWasCalled()).toBe(false);
		});

		it("rejects an empty static directory before replacing Build Output", async () => {
			await seed({
				".cloudflare/output/v0/config.json": "existing output",
			});

			await expect(runCf(["deploy", ""])).rejects.toThrow(
				"The static assets directory argument cannot be empty."
			);
			expect(readFileSync(".cloudflare/output/v0/config.json", "utf8")).toBe(
				"existing output"
			);
			expect(buildDelegateWasCalled()).toBe(false);
		});

		it("rejects a static directory inside Build Output before cleaning it", async () => {
			await seed({
				".cloudflare/output/static/index.html": "existing asset",
			});

			await expect(
				runCf(["deploy", ".cloudflare/output/static"])
			).rejects.toThrow(
				"The static assets directory cannot be inside .cloudflare/output, because that directory is replaced during deployment."
			);
			expect(readFileSync(".cloudflare/output/static/index.html", "utf8")).toBe(
				"existing asset"
			);
			expect(buildDelegateWasCalled()).toBe(false);
		});

		it("rejects a static directory containing Build Output", async () => {
			await seed({
				".cloudflare/index.html": "asset",
				".cloudflare/output/v0/config.json": "existing output",
			});

			await expect(runCf(["deploy", ".cloudflare"])).rejects.toThrow(
				"The static assets directory cannot contain .cloudflare/output. Choose the specific directory containing the built assets."
			);
			expect(readFileSync(".cloudflare/output/v0/config.json", "utf8")).toBe(
				"existing output"
			);
			expect(buildDelegateWasCalled()).toBe(false);
		});

		it.each<[string[], string]>([
			[
				["--prebuilt"],
				"A static assets directory cannot be combined with --prebuilt",
			],
			[
				["--worker", "another-worker"],
				"A static assets directory cannot be combined with --worker",
			],
		])(
			"rejects incompatible Build Output selection flags",
			async (args, message) => {
				await seed({ "public/index.html": "hello" });

				await expect(runCf(["deploy", "public", ...args])).rejects.toThrow(
					message
				);
				expect(buildDelegateWasCalled()).toBe(false);
			}
		);

		it("deploys assets and starts an upload session", async () => {
			const upload = mockWorkerUpload();
			const assets = mockAssetUpload();

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						mainModule: undefined,
						modules: undefined,
					}),
				".cloudflare/output/v0/workers/default/bundle/placeholder": "",
				".cloudflare/output/v0/workers/default/assets/index.html":
					"<html><body>hello</body></html>",
				".cloudflare/output/v0/workers/default/assets/style.css":
					"body { color: red; }",
			});

			const { exitCode } = await runCf(["deploy"]);

			expect(exitCode).toBe(0);
			expect(assets.sessionStarted).toBe(true);

			// Manifest should include both asset files
			const manifest = assets.manifest;
			expect(manifest).toBeDefined();
			const manifestPaths = Object.keys(manifest ?? {});
			expect(manifestPaths).toContain("/index.html");
			expect(manifestPaths).toContain("/style.css");

			// Each manifest entry should have hash and size
			for (const entry of Object.values(manifest ?? {})) {
				expect(entry.hash).toMatch(/^[0-9a-f]+$/);
				expect(entry.size).toBeGreaterThan(0);
			}

			// Assets-only deploys should not have main_module in metadata
			expect(upload.metadata?.main_module).toBeUndefined();

			// Metadata should reference the asset completion token
			const assetsMeta = upload.metadata?.assets as
				| { jwt?: string }
				| undefined;
			expect(assetsMeta?.jwt).toBeDefined();

			expect(std.out).toContain("Deployed");
		});

		it("sends asset manifest with correct hashes and sizes", async () => {
			mockWorkerUpload();
			const assets = mockAssetUpload();
			const htmlContent = "<html>test</html>";
			const cssContent = "body {}";

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						mainModule: undefined,
						modules: undefined,
					}),
				".cloudflare/output/v0/workers/default/bundle/placeholder": "",
				".cloudflare/output/v0/workers/default/assets/page.html": htmlContent,
				".cloudflare/output/v0/workers/default/assets/sub/style.css":
					cssContent,
			});

			await runCf(["deploy"]);

			const manifest = assets.manifest;
			expect(manifest).toBeDefined();
			// Paths should be absolute from the assets root
			expect(manifest?.["/page.html"]).toBeDefined();
			expect(manifest?.["/sub/style.css"]).toBeDefined();

			// Size should match content byte length
			expect(manifest?.["/page.html"]?.size).toBe(
				Buffer.byteLength(htmlContent)
			);
			expect(manifest?.["/sub/style.css"]?.size).toBe(
				Buffer.byteLength(cssContent)
			);
		});

		it("excludes _headers and _redirects from asset manifest", async () => {
			const upload = mockWorkerUpload();
			const assets = mockAssetUpload();
			const redirectsContent = "/old /new 301";
			const headersContent = "/*\n  X-Custom: value";

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						mainModule: undefined,
						modules: undefined,
					}),
				".cloudflare/output/v0/workers/default/bundle/placeholder": "",
				".cloudflare/output/v0/workers/default/assets/index.html":
					"<html></html>",
				".cloudflare/output/v0/workers/default/assets/_redirects":
					redirectsContent,
				".cloudflare/output/v0/workers/default/assets/_headers": headersContent,
			});

			await runCf(["deploy"]);

			// _redirects and _headers should NOT be in the asset manifest
			const manifestPaths = Object.keys(assets.manifest ?? {});
			expect(manifestPaths).toContain("/index.html");
			expect(manifestPaths).not.toContain("/_redirects");
			expect(manifestPaths).not.toContain("/_headers");

			// Their content should be in the upload metadata's asset config
			const assetsMeta = upload.metadata?.assets as
				| { config?: Record<string, unknown> }
				| undefined;
			expect(assetsMeta?.config?._redirects).toBe(redirectsContent);
			expect(assetsMeta?.config?._headers).toBe(headersContent);
		});

		it("uploads file content when server requests buckets", async () => {
			mockWorkerUpload();
			const assets = mockAssetUpload();

			// Override session handler to echo back all manifest hashes
			// as a single bucket, forcing an upload of all files.
			msw.use(
				http.post(
					"*/accounts/:accountId/workers/scripts/:scriptName/assets-upload-session",
					async ({ request }) => {
						assets.sessionStarted = true;
						const body = (await request.json()) as {
							manifest: Record<string, { hash: string; size: number }>;
						};
						assets.manifest = body.manifest;
						const allHashes = Object.values(body.manifest).map((e) => e.hash);
						return HttpResponse.json(
							createFetchResult({
								jwt: "test-upload-jwt",
								buckets: [allHashes],
							}),
							{ status: 201 }
						);
					},
					{ once: true }
				)
			);

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						mainModule: undefined,
						modules: undefined,
					}),
				".cloudflare/output/v0/workers/default/bundle/placeholder": "",
				".cloudflare/output/v0/workers/default/assets/file.txt":
					"Hello, world!",
			});

			const { exitCode } = await runCf(["deploy"]);

			expect(exitCode).toBe(0);
			expect(assets.uploadedBuckets).toHaveLength(1);

			// The uploaded FormData should have entries keyed by hash
			const bucket = assets.uploadedBuckets[0];
			const hash = assets.manifest?.["/file.txt"]?.hash;
			expect(bucket).toBeDefined();
			expect(hash).toBeDefined();
			const uploaded = bucket?.get(hash ?? "");
			expect(uploaded).not.toBeNull();

			// Auth header should use the session JWT, not the API token
			expect(assets.uploadAuthHeaders[0]).toBe("Bearer test-upload-jwt");
		});
	});

	describe("worker + assets", () => {
		it("deploys both a worker and assets", async () => {
			const upload = mockWorkerUpload();
			const assets = mockAssetUpload();

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig(),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
				".cloudflare/output/v0/workers/default/assets/index.html":
					"<html><body>app</body></html>",
				".cloudflare/output/v0/workers/default/assets/app.js":
					"console.log('app');",
			});

			const { exitCode } = await runCf(["deploy"]);

			expect(exitCode).toBe(0);
			expect(assets.sessionStarted).toBe(true);
			expect(upload.metadata?.main_module).toBe("index.js");

			// Manifest should include both asset files
			const manifestPaths = Object.keys(assets.manifest ?? {});
			expect(manifestPaths).toContain("/index.html");
			expect(manifestPaths).toContain("/app.js");

			// Worker upload metadata should reference assets
			const assetsMeta = upload.metadata?.assets as
				| { jwt?: string; config?: Record<string, unknown> }
				| undefined;
			expect(assetsMeta?.jwt).toBeDefined();
		});

		it("passes asset config from worker.config.json", async () => {
			const upload = mockWorkerUpload();
			mockAssetUpload();

			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						assets: {
							htmlHandling: "none",
							notFoundHandling: "404-page",
						},
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
				".cloudflare/output/v0/workers/default/assets/index.html":
					"<html></html>",
			});

			await runCf(["deploy"]);

			const assetsMeta = upload.metadata?.assets as
				| { config?: Record<string, unknown> }
				| undefined;
			expect(assetsMeta?.config?.html_handling).toBe("none");
			expect(assetsMeta?.config?.not_found_handling).toBe("404-page");
		});
	});
});
