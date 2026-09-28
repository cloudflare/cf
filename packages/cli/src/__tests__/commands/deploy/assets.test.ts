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
