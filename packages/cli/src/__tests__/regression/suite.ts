import { existsSync, readFileSync } from "node:fs";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { http } from "msw/http";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { runMain } from "../../index.js";
import { CliExit } from "../../lib/cli-exit.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import {
	agentEnvironmentKeys,
	commandCases,
	handwritten,
	shardCommands,
	shardGroups,
} from "./cases.js";
import { normalize, recordRequest } from "./record.js";
import {
	seedWorkflow,
	workflowRequestPaths,
	workflowResponse,
} from "./workflows.js";
import type { RecordedRequest } from "./record.js";

// Keep the CLI and its HTTP clients real. Only OS tools and package installs are
// replaced: they cannot be intercepted by MSW or finish within the suite budget.
vi.mock("../../commands/cloudflared.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	runCloudflared: vi.fn(async () => 0),
}));
vi.mock("../../lib/autoconfig.js", () => ({
	analyzeProject: vi.fn(async () => undefined),
	configureProject: vi.fn(async () => ({})),
	prepareProject: vi.fn(async () => ({ details: undefined })),
	runProjectCommand: vi.fn(async () => ({ exitCode: 0, signal: null })),
}));
vi.mock("../../commands/workers/types/generate.js", () => ({
	generateWorkerTypes: vi.fn(async () => ".cloudflare/types/index.d.ts"),
}));
vi.mock("../../commands/dev/spawn.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	spawnImpl: vi.fn(async () => ({ exitCode: 0 })),
}));
vi.mock(
	"@cloudflare/deploy-helpers/startup-profile",
	async (importOriginal) => ({
		...(await importOriginal<Record<string, unknown>>()),
		analyseBundle: vi.fn(async () => ({
			nodes: [],
			startTime: 0,
			endTime: 1000,
			samples: [],
			timeDeltas: [],
		})),
	})
);
vi.mock("miniflare", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	Miniflare: class {
		dispatchFetch(url: string, init: RequestInit) {
			return globalThis.fetch(url, init);
		}
		async dispose() {}
	},
}));
vi.mock("tinyexec", () => ({
	x: () => {
		throw new Error("Regression fixture has no external executable");
	},
}));

export function regressionShard(shard: number): void {
	describe(`HTTP regression shard ${shard + 1}`, () => {
		setupMsw();
		runInTempDir();
		mockConsoleMethods();
		beforeEach(() => {
			for (const name of agentEnvironmentKeys) {
				vi.stubEnv(name, undefined);
			}
			vi.stubEnv("CODEX_THREAD_ID", "regression-session");
			for (const [name, value] of Object.entries({
				CLOUDFLARE_API_TOKEN: "regression-api-token",
				CLOUDFLARE_ACCOUNT_ID: "0123456789abcdef0123456789abcdef",
				CLOUDFLARE_ZONE_ID: "abcdef0123456789abcdef0123456789",
				CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
				CLOUDFLARE_COMPLIANCE_REGION: undefined,
				CLOUDFLARE_PROFILE: undefined,
				CLOUDFLARE_ENV: undefined,
				CF_SEND_TELEMETRY: "0",
				CF_QUIET: "1",
				CI: "1",
				npm_config_user_agent: undefined,
				DEBUG: undefined,
			})) {
				vi.stubEnv(name, value);
			}
			vi.clearAllMocks();
			vi.spyOn(process.stdout, "write").mockImplementation(() => true);
			vi.spyOn(process.stderr, "write").mockImplementation(() => true);
		});
		afterEach(() => vi.restoreAllMocks());

		const commands = shardCommands()[shard] ?? [];
		for (const command of commands) {
			it(command.command, async () => {
				seedWorkflow(command.command);
				const requests: RecordedRequest[] = [];
				const recordings: {
					case: string;
					argv: string[];
					exitCode: number;
					error?: string;
					requests: RecordedRequest[];
				}[] = [];
				server.use(
					http.all("*", async ({ request }) => {
						const index = requests.length;
						requests.length++;
						requests[index] = await recordRequest(request);
						return workflowResponse(command.command, request);
					})
				);
				for (const scenario of commandCases(command)) {
					requests.length = 0;
					// A CLI launched without a pipe receives EOF. Vitest's own stdin
					// stays open, which would hang secret-field no-argument cases.
					vi.spyOn(process, "stdin", "get").mockReturnValue(
						Readable.from([]) as unknown as typeof process.stdin
					);
					const argv = [
						...(scenario.commandPath ?? command.fullPath),
						...scenario.args,
					];
					let outcome: { exitCode: number; error?: string } = { exitCode: 0 };
					try {
						await runMain(argv);
					} catch (error) {
						outcome =
							error instanceof CliExit
								? { exitCode: error.code }
								: {
										exitCode: 1,
										error: normalize(
											error instanceof Error ? error.message : String(error),
											process.cwd()
										),
									};
					}
					recordings.push({
						case: scenario.name,
						argv: argv.map((arg) => normalize(arg, process.cwd())),
						...outcome,
						requests: [...requests],
					});
				}
				if (!handwritten.has(command.command)) {
					const endpoint = new RegExp(
						"^/client/v4" +
							command.apiPath
								?.split(/(\{[^}]+\})/)
								.map((part) =>
									part.startsWith("{")
										? "[^/]+"
										: part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
								)
								.join("") +
							"$"
					);
					expect(
						recordings.some((recording) =>
							recording.requests.some(
								(request) =>
									request.method === command.httpMethod &&
									endpoint.test(new URL(request.url).pathname)
							)
						),
						`${command.command} never reached ${command.httpMethod} ${command.apiPath}. Fix its fixture arguments; do not approve an empty request baseline.`
					).toBe(true);
				}
				const workflowPath = workflowRequestPaths[command.command];
				if (workflowPath) {
					expect(
						recordings.some((recording) =>
							recording.requests.some((request) =>
								new URL(request.url).pathname.includes(workflowPath)
							)
						),
						`${command.command} never reached ${workflowPath}. Fix its fixture before updating the request baseline.`
					).toBe(true);
				}
				const snapshotPath = fileURLToPath(
					new URL(
						`./snapshots/${command.fullPath.join("/")}.snap`,
						import.meta.url
					)
				);
				let baseline: unknown;
				if (existsSync(snapshotPath)) {
					try {
						baseline = JSON.parse(readFileSync(snapshotPath, "utf8"));
					} catch {
						// The snapshot matcher still shows a diff for malformed baselines.
					}
				}
				const previous = Array.isArray(baseline) ? baseline : [];
				const changed = recordings.filter(
					(recording, index) =>
						JSON.stringify(recording) !== JSON.stringify(previous[index])
				);
				const context = changed
					.slice(0, 5)
					.map(
						(recording) =>
							`${recording.case}: ${JSON.stringify(recording.argv)}`
					)
					.join("\n");
				await expect(
					JSON.stringify(recordings, null, 2) + "\n",
					`${command.command}\nRequest snapshot: ${snapshotPath}\nChanged cases (argv):\n${context}\nReview changed method, URL, headers and body before updating snapshots.`
				).toMatchFileSnapshot(snapshotPath);
			});
		}
		for (const group of shardGroups(shard)) {
			it(`${group ? `cf ${group}` : "cf"} (group, no args)`, async () => {
				const requests: RecordedRequest[] = [];
				server.use(
					http.all("*", async ({ request }) => {
						requests.push(await recordRequest(request));
						return workflowResponse(`cf ${group}`, request);
					})
				);
				const argv = group ? group.split(" ") : [];
				try {
					await runMain(argv);
				} catch (error) {
					expect(error).toBeInstanceOf(CliExit);
					expect((error as CliExit).code).toBe(0);
				}
				await expect(
					JSON.stringify({ argv, requests }, null, 2) + "\n"
				).toMatchFileSnapshot(
					fileURLToPath(
						new URL(
							`./snapshots/groups/${group ? group.split(" ").join("/") : "_root"}.snap`,
							import.meta.url
						)
					)
				);
			});
		}
	});
}
