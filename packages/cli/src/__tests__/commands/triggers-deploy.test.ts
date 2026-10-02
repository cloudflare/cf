import { readFileSync } from "node:fs";
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
	buildDelegateWasCalled,
	mockDefaultHandlers,
	readBuildDelegateArgv,
	readBuildDelegateEnvironment,
	recordRequests,
	seedBuildDelegate,
	buildOutputRootConfig,
	workerConfig,
} from "./deploy/helpers.js";

vi.mock("../../lib/deploy-context.js", () => ({
	createDeployContext: (authToken: string) =>
		createMockDeployContext(authToken),
}));

const TRIGGERS_DEPLOY_COMMAND = ["workers", "triggers", "deploy"];

describe("cf workers triggers deploy", () => {
	setupMsw();
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "test-api-token");
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID);
		mockDefaultHandlers();
		await seedBuildDelegate();
	});

	it.each([
		{ flags: [] },
		{ flags: ["--prebuilt"] },
		{ flags: ["--dry-run"] },
		{ flags: ["--prebuilt", "--dry-run"] },
	])(
		"rejects --local before building or making API requests with $flags",
		async ({ flags }) => {
			const requests = recordRequests();
			await seed({
				".cloudflare/output/v0/config.json": buildOutputRootConfig(),
				".cloudflare/output/v0/workers/default/worker.config.json":
					workerConfig({
						triggers: [{ type: "scheduled", schedule: "*/5 * * * *" }],
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js":
					"export default { fetch() { return new Response('ok'); } }",
			});

			await expect(
				runCf([...TRIGGERS_DEPLOY_COMMAND, "--local", ...flags])
			).rejects.toThrow(
				"--local is not supported by cf workers triggers deploy."
			);

			expect(buildDelegateWasCalled()).toBe(false);
			expect(requests).toEqual([]);
		}
	);

	it("explains the local-mode restriction in help without executing", async () => {
		const requests = recordRequests();
		await expect(
			runCf([...TRIGGERS_DEPLOY_COMMAND, "--local", "--help"])
		).resolves.toEqual({ exitCode: 0 });

		expect(std.out).toContain("Local simulation (--local) is not supported");
		expect(std.out).not.toContain("Use local resource simulations");
		expect(std.out).not.toContain("--persist-to");
		expect(buildDelegateWasCalled()).toBe(false);
		expect(requests).toEqual([]);
	});

	it("builds and deploys scheduled triggers with --local=false", async () => {
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
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: false, mode: "staging" },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				triggers: [{ type: "scheduled", schedule: "*/5 * * * *" }],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf([
			...TRIGGERS_DEPLOY_COMMAND,
			"--local=false",
			"--mode",
			"staging",
		]);

		expect(exitCode).toBe(0);
		expect(readBuildDelegateArgv()).toEqual(["build", "--mode", "staging"]);
		expect(schedulesBody).toEqual([{ cron: "*/5 * * * *" }]);
		expect(std.out).toContain("Deployed test-worker triggers");
	});

	it("loads dotenv values after the delegated build", async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
		let valueDuringApiRequest: string | undefined;
		let authorizationDuringApiRequest: string | null = null;
		msw.use(
			http.put(
				"*/accounts/:accountId/workers/scripts/:scriptName/schedules",
				({ request }) => {
					valueDuringApiRequest = process.env.CLOUDFLARE_ACCOUNT_ID;
					authorizationDuringApiRequest = request.headers.get("authorization");
					return HttpResponse.json(createFetchResult({ schedules: [] }));
				},
				{ once: true }
			)
		);
		await seed({
			".env": [
				"CLOUDFLARE_API_TOKEN=file-token",
				`CLOUDFLARE_ACCOUNT_ID=${ACCOUNT_ID}`,
			].join("\n"),
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				triggers: [{ type: "scheduled", schedule: "*/5 * * * *" }],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf(TRIGGERS_DEPLOY_COMMAND);

		expect(exitCode).toBe(0);
		expect(readBuildDelegateEnvironment()).toBe("");
		expect(valueDuringApiRequest).toBe(ACCOUNT_ID);
		expect(authorizationDuringApiRequest).toBe("Bearer file-token");
		expect(process.env.CLOUDFLARE_ACCOUNT_ID).toBeUndefined();
	});

	it("skips the build and deploys existing triggers with --prebuilt", async () => {
		let schedulesBody: unknown;
		let schedulesAccount: unknown;
		msw.use(
			http.put(
				"*/accounts/:accountId/workers/scripts/:scriptName/schedules",
				async ({ request, params }) => {
					schedulesBody = await request.json();
					schedulesAccount = params.accountId;
					return HttpResponse.json(createFetchResult({ schedules: [] }));
				},
				{ once: true }
			)
		);
		await seed({
			"cloudflare.config.ts": `export default () => { throw new Error("Project config should not be reevaluated"); };`,
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				accountId: "built-account",
				complianceRegion: "fedramp-high",
			}),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				triggers: [{ type: "scheduled", schedule: "*/5 * * * *" }],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf([
			...TRIGGERS_DEPLOY_COMMAND,
			"--prebuilt",
		]);

		expect(exitCode).toBe(0);
		expect(buildDelegateWasCalled()).toBe(false);
		expect(schedulesBody).toEqual([{ cron: "*/5 * * * *" }]);
		expect(schedulesAccount).toBe("built-account");
	});

	it("selects an account without rereading config when output omits it", async () => {
		let schedulesCalled = false;
		let schedulesAccount: unknown;
		msw.use(
			http.put(
				"*/accounts/:accountId/workers/scripts/:scriptName/schedules",
				({ params }) => {
					schedulesCalled = true;
					schedulesAccount = params.accountId;
					return HttpResponse.json(createFetchResult({ schedules: [] }));
				}
			)
		);
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "env-account");
		await seed({
			"cloudflare.config.ts": `export default () => { throw new Error("Project config should not be reevaluated"); };`,
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				complianceRegion: "fedramp-high",
				buildContext: { isPreview: false, mode: "staging" },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				triggers: [{ type: "scheduled", schedule: "*/5 * * * *" }],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf([
			...TRIGGERS_DEPLOY_COMMAND,
			"--prebuilt",
		]);

		expect(exitCode).toBe(0);
		expect(buildDelegateWasCalled()).toBe(false);
		expect(schedulesCalled).toBe(true);
		expect(schedulesAccount).toBe("env-account");
	});

	it("deploys the triggers of the Worker selected by --worker", async () => {
		let schedules: { scriptName: unknown; body: unknown } | undefined;
		msw.use(
			http.put(
				"*/accounts/:accountId/workers/scripts/:scriptName/schedules",
				async ({ request, params }) => {
					schedules = {
						scriptName: params.scriptName,
						body: await request.json(),
					};
					return HttpResponse.json(createFetchResult({ schedules: [] }));
				},
				{ once: true }
			)
		);
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				triggers: [{ type: "scheduled", schedule: "*/5 * * * *" }],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
			".cloudflare/output/v0/workers/api/worker.config.json": workerConfig({
				name: "api",
				triggers: [{ type: "scheduled", schedule: "0 * * * *" }],
			}),
			".cloudflare/output/v0/workers/api/bundle/index.js":
				"export default { fetch() { return new Response('api'); } }",
		});

		const { exitCode } = await runCf([
			...TRIGGERS_DEPLOY_COMMAND,
			"--prebuilt",
			"--worker",
			"api",
		]);

		expect(exitCode).toBe(0);
		expect(schedules).toEqual({
			scriptName: "api",
			body: [{ cron: "0 * * * *" }],
		});
		expect(std.out).toContain("Deployed api triggers");
	});

	it("does not deploy triggers built for a different mode", async () => {
		let schedulesCalled = false;
		msw.use(
			http.put(
				"*/accounts/:accountId/workers/scripts/:scriptName/schedules",
				() => {
					schedulesCalled = true;
					return HttpResponse.json(createFetchResult({ schedules: [] }));
				}
			)
		);
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: false, mode: "production" },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				triggers: [{ type: "scheduled", schedule: "*/5 * * * *" }],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		await expect(
			runCf([...TRIGGERS_DEPLOY_COMMAND, "--mode", "staging"])
		).rejects.toThrow(
			'The Build Output was created with mode "production", but this command requested mode "staging". To use the existing Build Output, rerun with "--mode production". To deploy in staging mode, rebuild with "--mode staging" before deploying.'
		);

		expect(schedulesCalled).toBe(false);
	});

	it("rejects Preview Build Output", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: true, mode: "staging" },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default {};",
		});

		await expect(
			runCf([...TRIGGERS_DEPLOY_COMMAND, "--prebuilt"])
		).rejects.toThrow(
			'The Build Output was created for a Preview, but this command deploys production triggers. To use the existing Build Output and deploy the Preview, run "cf previews deploy --prebuilt --mode staging". To deploy production triggers, rebuild without Preview settings before deploying.'
		);
		expect(buildDelegateWasCalled()).toBe(false);
	});

	it("makes no API requests and needs no credentials during a dry run", async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
		const requests = recordRequests();
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				triggers: [{ type: "scheduled", schedule: "*/5 * * * *" }],
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } }",
		});

		const { exitCode } = await runCf([...TRIGGERS_DEPLOY_COMMAND, "--dry-run"]);

		expect(exitCode).toBe(0);
		expect(requests).toEqual([]);
		expect(std.out).toContain("--dry-run: exiting now.");
	});
});

describe("cf workers triggers deploy — metadata guard", () => {
	function readJson<T>(relative: string): T {
		return JSON.parse(
			readFileSync(new URL(relative, import.meta.url), "utf-8")
		) as T;
	}

	it("publishes the hand-written subgroup under workers", () => {
		const commands = readJson<{
			commands: {
				command: string;
				name: string;
				fullPath: string[];
				usage: string;
				category: string;
				options: {
					name: string;
					type: string;
					default?: unknown;
				}[];
			}[];
		}>("../../commands/_generated/_meta/commands.json").commands;

		const triggerDeploy = commands.find(
			(command) => command.command === "cf workers triggers deploy"
		);

		expect(triggerDeploy).toMatchObject({
			command: "cf workers triggers deploy",
			name: "deploy",
			fullPath: ["workers", "triggers", "deploy"],
			usage: "cf workers triggers deploy [options]",
			category: "action",
		});
		expect(triggerDeploy?.options).toContainEqual(
			expect.objectContaining({
				name: "prebuilt",
				type: "boolean",
				default: false,
			})
		);
		expect(
			commands.some((command) => command.command === "cf triggers deploy")
		).toBe(false);
	});
});
