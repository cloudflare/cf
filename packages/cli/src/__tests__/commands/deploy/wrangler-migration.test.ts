import { existsSync, readFileSync, readdirSync, symlinkSync } from "node:fs";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { readBuildOutput } from "@cloudflare/build-output-utils";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { Miniflare } from "miniflare";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { parseWorkerConfig } from "../../../lib/build-output.js";
import { mockOutputStreams } from "../../helpers/capture-output.js";
import { setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";
import { recordRequests } from "./helpers.js";
import type * as Clack from "@clack/prompts";

const ciInfo = vi.hoisted(() => ({ isCI: false }));
const confirm = vi.hoisted(() => vi.fn().mockResolvedValue(false));
vi.mock("@clack/prompts", async (importOriginal) => ({
	...(await importOriginal<typeof Clack>()),
	confirm,
}));
vi.mock("ci-info", () => ({ default: ciInfo }));
vi.mock("../../../lib/update-check.js", () => ({
	getUpdateNotice: () => undefined,
	maybeStartBackgroundUpdateCheck: () => {},
}));

const legacyProject = {
	"package.json": JSON.stringify({
		name: "legacy-worker",
		type: "module",
		devDependencies: { cf: "1.0.0-rc.6", wrangler: "4.168.0" },
	}),
	"wrangler.jsonc": JSON.stringify({
		name: "legacy-worker",
		main: "src/worker.js",
		compatibility_date: "2026-08-15",
		assets: { directory: "./public" },
		vars: { API_MESSAGE: "Hello from a binding" },
	}),
	"public/index.html": "<!doctype html><title>Home</title>",
	"src/worker.js": `export default {
		fetch(request, env) {
			if (new URL(request.url).pathname === "/api") {
				return new Response(env.API_MESSAGE);
			}
			return new Response(null, { status: 404 });
		}
	};`,
};

function projectFiles(): string[] {
	return readdirSync(".", { recursive: true, encoding: "utf8" })
		.filter((file) => file !== "home" && !file.startsWith(`home${sep}`))
		.sort((left, right) => left.localeCompare(right));
}

describe("deploying a legacy Wrangler project", () => {
	runInTempDir();
	setupMsw();
	const std = mockOutputStreams();
	beforeEach(() => vi.stubEnv("CF_SEND_TELEMETRY", "false"));

	it.each([
		{
			scenario: "declined in a TTY",
			stdinTTY: true,
			isCI: false,
			prompted: true,
		},
		{
			scenario: "unavailable in CI",
			stdinTTY: true,
			isCI: true,
			prompted: false,
		},
		{
			scenario: "unavailable with piped stdin",
			stdinTTY: false,
			isCI: false,
			prompted: false,
		},
	])(
		"stops before setup when migration is $scenario",
		async ({ stdinTTY, isCI, prompted }) => {
			await seed(legacyProject);
			const requests = recordRequests();
			const before = projectFiles();
			const originalStdinTTY = Object.getOwnPropertyDescriptor(
				process.stdin,
				"isTTY"
			);
			Object.defineProperty(process.stdin, "isTTY", {
				configurable: true,
				value: stdinTTY,
			});
			std.setStderrTTY(true);
			ciInfo.isCI = isCI;
			confirm.mockClear();
			try {
				await expect(runCf(["deploy"])).rejects.toThrow(
					"Wrangler migration did not run"
				);
				expect(std.err).toContain("cf migrate wrangler.jsonc");
				expect(confirm).toHaveBeenCalledTimes(prompted ? 1 : 0);
				expect(projectFiles()).toEqual(before);
				for (const [file, contents] of Object.entries(legacyProject)) {
					expect(readFileSync(file, "utf8")).toBe(contents);
				}
				expect(requests).toEqual([]);
			} finally {
				ciInfo.isCI = false;
				if (originalStdinTTY) {
					Object.defineProperty(process.stdin, "isTTY", originalStdinTTY);
				} else {
					Reflect.deleteProperty(process.stdin, "isTTY");
				}
			}
		}
	);

	it("builds a working Worker route and binding after explicit migration", async () => {
		await seed({
			...legacyProject,
			"node_modules/cf/package.json": JSON.stringify({
				name: "cf",
				type: "module",
				exports: { "./config": "./config.mjs" },
			}),
			"node_modules/cf/config.mjs": `export * from ${JSON.stringify(import.meta.resolve("@cloudflare/config/public"))};`,
		});
		symlinkSync(
			fileURLToPath(
				new URL(
					"../../../../../../fixtures/wrangler-bundler-project/node_modules/wrangler/",
					import.meta.url
				)
			),
			resolve("node_modules/wrangler"),
			"junction"
		);
		vi.stubEnv("CLOUDFLARE_ENV", undefined);
		vi.stubEnv("WRANGLER_LOG_PATH", resolve(".wrangler/logs"));

		const migration = await runCf([
			"migrate",
			"wrangler.jsonc",
			"--no-install",
		]);
		expect(migration.exitCode).toBe(0);
		const build = await runCf(["build"]);
		expect(build.exitCode).toBe(0);
		expect(existsSync("cloudflare.config.ts")).toBe(true);

		const { rootConfig, workers } = await readBuildOutput(process.cwd());
		const worker = workers.default;
		const { name } = worker.config;
		const {
			main,
			vars,
			compatibility_date: compatibilityDate,
		} = parseWorkerConfig(worker, rootConfig).wranglerConfig;
		if (
			!name ||
			!main ||
			!compatibilityDate ||
			!worker.assetsDir ||
			typeof vars.API_MESSAGE !== "string"
		) {
			throw new Error(
				"Expected migrated Build Output to include the Worker, assets, and text binding"
			);
		}
		const runtime = new Miniflare({
			cf: false,
			workers: [
				{
					config: {
						name,
						compatibilityDate,
						manifest: {
							mainModule: "worker.mjs",
							modules: {
								"worker.mjs": {
									type: "esm",
									contents: readFileSync(main, "utf8"),
								},
							},
						},
						assets: { directory: worker.assetsDir, hasUserWorker: true },
						env: { API_MESSAGE: { type: "text", value: vars.API_MESSAGE } },
					},
				},
			],
		});
		try {
			const api = await runtime.dispatchFetch("http://localhost/api");
			expect(api.status).toBe(200);
			expect(await api.text()).toBe("Hello from a binding");
			const homepage = await runtime.dispatchFetch("http://localhost/");
			expect(homepage.status).toBe(200);
			expect(await homepage.text()).toBe(legacyProject["public/index.html"]);
		} finally {
			await runtime.dispose();
		}
	}, 120_000);
});
