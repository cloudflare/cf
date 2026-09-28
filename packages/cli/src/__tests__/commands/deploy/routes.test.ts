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
	captureCustomDomains,
	captureRoutes,
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

describe("cf deploy — routes", () => {
	setupMsw();
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		mockDefaultHandlers();
		await seedBuildDelegate();
	});

	it("publishes routes from fetch triggers", async () => {
		mockWorkerUpload();
		const routes = captureRoutes();

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
		expect(routes.called).toBe(true);
		// deploy-helpers normalizes string routes to { pattern } objects
		expect(routes.body).toEqual([{ pattern: "example.com/*" }]);
		expect(std.out).toContain("Deployed");
	});

	it("publishes multiple routes", async () => {
		mockWorkerUpload();
		const routes = captureRoutes();

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				triggers: [
					{ type: "fetch", pattern: "api.example.com/*" },
					{ type: "fetch", pattern: "app.example.com/*" },
				],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(["deploy"]);

		expect(exitCode).toBe(0);
		expect(routes.called).toBe(true);
		expect(routes.body).toEqual(
			expect.arrayContaining([
				{ pattern: "api.example.com/*" },
				{ pattern: "app.example.com/*" },
			])
		);
	});

	it("publishes custom domains from the domains field", async () => {
		mockWorkerUpload();
		const domains = captureCustomDomains();

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				domains: ["custom.example.com"],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(["deploy"]);

		expect(exitCode).toBe(0);
		// In non-TTY mode, deploy-helpers skips the changeset and goes
		// straight to publish with override flags.
		expect(domains.publishCalled).toBe(true);
		const publishBody = domains.publishBody as {
			override_existing_origin: boolean;
			override_existing_dns_record: boolean;
			origins: Array<{ hostname: string }>;
		};
		expect(publishBody.override_existing_origin).toBe(true);
		expect(publishBody.override_existing_dns_record).toBe(true);
		expect(publishBody.origins).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ hostname: "custom.example.com" }),
			])
		);
	});

	it("publishes both routes and custom domains together", async () => {
		mockWorkerUpload();
		const routes = captureRoutes();
		const domains = captureCustomDomains();

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				domains: ["custom.example.com"],
				triggers: [{ type: "fetch", pattern: "api.example.com/*" }],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(["deploy"]);

		expect(exitCode).toBe(0);
		expect(routes.called).toBe(true);
		expect(domains.publishCalled).toBe(true);
		expect(std.out).toContain("Deployed");
	});

	it("publishes scheduled triggers alongside routes", async () => {
		mockWorkerUpload();
		const routes = captureRoutes();
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

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				triggers: [
					{ type: "fetch", pattern: "example.com/*" },
					{ type: "scheduled", schedule: "0 * * * *" },
				],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(["deploy"]);

		expect(exitCode).toBe(0);
		expect(routes.called).toBe(true);
		expect(schedulesBody).toEqual(
			expect.arrayContaining([expect.objectContaining({ cron: "0 * * * *" })])
		);
	});
});
