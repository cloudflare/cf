import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createMockDeployContext } from "../../helpers/mock-deploy-context.js";
import { setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";
import {
	ACCOUNT_ID,
	captureSubdomain,
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

describe("cf deploy — workers.dev subdomain", () => {
	setupMsw();
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		mockDefaultHandlers();
		await seedBuildDelegate();
	});

	it("enables workers.dev when no routes are defined", async () => {
		mockWorkerUpload();
		const subdomain = captureSubdomain();

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(["deploy"]);

		expect(exitCode).toBe(0);
		expect(subdomain.postCalled).toBe(true);
		expect(subdomain.postBody).toEqual(
			expect.objectContaining({ enabled: true })
		);
		expect(std.out).toContain("Deployed");
	});

	it("disables workers.dev when workersDev is false", async () => {
		mockWorkerUpload();
		const subdomain = captureSubdomain();

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				workersDev: false,
				triggers: [{ type: "fetch", pattern: "example.com/*" }],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(["deploy"]);

		expect(exitCode).toBe(0);
		expect(subdomain.postCalled).toBe(true);
		expect(subdomain.postBody).toEqual(
			expect.objectContaining({ enabled: false })
		);
	});

	it("disables workers.dev when routes are present and workersDev is undefined", async () => {
		mockWorkerUpload();
		const subdomain = captureSubdomain();

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				triggers: [{ type: "fetch", pattern: "example.com/*" }],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(["deploy"]);

		expect(exitCode).toBe(0);
		expect(subdomain.postCalled).toBe(true);
		expect(subdomain.postBody).toEqual(
			expect.objectContaining({ enabled: false })
		);
	});

	it("always POSTs subdomain state even when already enabled", async () => {
		mockWorkerUpload();
		const subdomain = captureSubdomain({
			currentState: { enabled: true, previews_enabled: true },
		});

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(["deploy"]);

		expect(exitCode).toBe(0);
		// deploy-helpers always POSTs subdomain state
		expect(subdomain.postCalled).toBe(true);
		expect(subdomain.postBody).toEqual(
			expect.objectContaining({ enabled: true })
		);
	});

	it("reports workers.dev URL in deploy targets", async () => {
		mockWorkerUpload();
		captureSubdomain();

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(["deploy"]);

		expect(exitCode).toBe(0);
		expect(std.out).toContain("test-worker.test-subdomain.workers.dev");
	});
});
