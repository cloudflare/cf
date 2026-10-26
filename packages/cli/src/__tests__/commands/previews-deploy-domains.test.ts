import { writeWorkerConfig } from "@cloudflare/build-output-utils";
import { InputWorkerSchema } from "@cloudflare/config";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createMockDeployContext } from "../helpers/mock-deploy-context.js";
import { createFetchResult, msw, setupMsw } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";
import { toString } from "../helpers/serialize-form-data-entry.js";
import {
	ACCOUNT_ID,
	buildOutputRootConfig,
	captureCustomDomains,
} from "./deploy/helpers.js";

vi.mock("../../lib/deploy-context.js", () => ({
	createDeployContext: (authToken: string) =>
		createMockDeployContext(authToken),
}));

describe("cf previews deploy — custom domains", () => {
	setupMsw();
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
	});

	it("uses the parent's hosting and returns custom domain URLs", async () => {
		const preview = {
			id: "preview-id",
			name: "feature",
			slug: "feature",
			urls: ["https://feature.previews.example.com"],
			created_on: "2026-01-01T00:00:00Z",
			updated_on: "2026-01-01T00:00:00Z",
		};
		const deployment = {
			id: "deployment-id",
			preview_id: preview.id,
			preview_name: preview.name,
			urls: ["https://deployment-id-feature.previews.example.com"],
			created_on: "2026-01-01T00:00:00Z",
		};
		const domains = captureCustomDomains();
		let metadata: unknown;
		msw.use(
			http.get("*/workers/workers/test-worker/previews/feature", () =>
				HttpResponse.json(createFetchResult(preview))
			),
			http.get("*/previews/preview-id/deployments/latest", () =>
				HttpResponse.json(createFetchResult(deployment))
			),
			http.post("*/previews/preview-id/deployments", async ({ request }) => {
				const form = await request.formData();
				metadata = JSON.parse(await toString(form.get("metadata")));
				return HttpResponse.json(createFetchResult(deployment));
			})
		);
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: true },
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});
		await writeWorkerConfig({
			root: process.cwd(),
			config: InputWorkerSchema.parse({
				name: "test-worker",
				compatibilityDate: "2025-01-01",
				domains: [
					"example.com",
					{
						hostname: "previews.example.com",
						production: false,
						previews: true,
					},
				],
			}),
			manifest: {
				type: "complete",
				mainModule: "index.js",
				modules: { "index.js": { type: "esm" } },
			},
		});

		expect(
			await runCf(["previews", "deploy", "feature", "--prebuilt"])
		).toEqual({
			exitCode: 0,
		});
		expect(JSON.parse(std.out)).toMatchObject({
			preview_urls: preview.urls,
			deployment_urls: deployment.urls,
		});
		expect(metadata).toMatchObject({ main_module: "index.js" });
		expect(metadata).not.toHaveProperty("domains");
		expect(metadata).not.toHaveProperty("routes");
		expect(domains.changesetCalled).toBe(false);
		expect(domains.publishCalled).toBe(false);
	});
});
