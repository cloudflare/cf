import { Buffer } from "node:buffer";
import { existsSync, readFileSync, symlinkSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as startupProfile from "@cloudflare/deploy-helpers/startup-profile";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { runCf } from "../helpers/run-cf.js";
import {
	buildDelegateWasCalled,
	readBuildDelegateArgv,
	seedBuildDelegate,
	buildOutputRootConfig,
	workerConfig,
} from "./deploy/helpers.js";

vi.mock("@cloudflare/deploy-helpers/startup-profile", { spy: true });

// Keep the successful binding checks on-CPU long enough to appear in the
// sampled profile; a fixed workload avoids workerd's frozen wall clock.
const PROFILE_MARKER_ITERATIONS = 10_000_000;
const BINDINGS_AVAILABLE_FUNCTION = "markWorkersCheckBindingsAvailable";
const WRANGLER_FIXTURE_ROOT = fileURLToPath(
	new URL("../../../../../fixtures/wrangler-bundler-project/", import.meta.url)
);
const WRANGLER_FIXTURE_FILES = [
	"package.json",
	"cloudflare.config.ts",
	"src/worker.ts",
] as const;

interface StartupProfile {
	nodes: Array<{ callFrame: { functionName: string } }>;
	startTime: number;
	endTime: number;
}

function readProfileUploadMetadata(): Record<string, unknown> {
	const call = vi.mocked(startupProfile.analyseBundle).mock.calls[0];
	if (call === undefined) {
		throw new Error("Expected workers check to invoke the startup profiler");
	}
	const [workerBundle] = call;
	if (typeof workerBundle === "string") {
		throw new Error("Expected workers check to profile an in-memory upload");
	}
	const metadata = workerBundle.get("metadata");
	if (typeof metadata !== "string") {
		throw new Error("Expected the profile upload to contain string metadata");
	}
	return JSON.parse(metadata) as Record<string, unknown>;
}

describe("cf workers check", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
	});

	it("builds and profiles a Worker with modules and source maps", async () => {
		await seedBuildDelegate();
		const entry =
			'import { message } from "./message.js";\nconsole.log("startup log");\nexport default { fetch() { return new Response(message); } };';
		const helper = 'export const message = "ok";';

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: false, mode: "staging" },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				modules: {
					"index.js": { type: "esm" },
					"message.js": { type: "esm" },
					"index.js.map": { type: "sourcemap" },
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js": entry,
			".cloudflare/output/v0/workers/default/bundle/message.js": helper,
			".cloudflare/output/v0/workers/default/bundle/index.js.map":
				JSON.stringify({
					version: 3,
					file: "index.js",
					sources: ["src/index.ts"],
					names: [],
					mappings: "",
				}),
		});

		const { exitCode } = await runCf(["workers", "check", "--mode", "staging"]);

		expect(exitCode).toBe(0);
		expect(readBuildDelegateArgv()).toEqual(["build", "--mode", "staging"]);

		const profile = JSON.parse(
			await readFile("worker-startup.cpuprofile", "utf8")
		) as StartupProfile;
		expect(profile.nodes.length).toBeGreaterThan(0);
		expect(profile.startTime).toEqual(expect.any(Number));
		expect(profile.endTime).toEqual(expect.any(Number));

		const output = JSON.parse(std.out) as {
			bundle: { sizeBytes: number; gzipSizeBytes: number };
			startup: Record<string, number>;
			profile: string;
			note: string;
		};
		expect(output.bundle.sizeBytes).toBe(
			Buffer.byteLength(entry) + Buffer.byteLength(helper)
		);
		expect(output.bundle.gzipSizeBytes).toBeGreaterThan(0);
		expect(output.startup).toEqual({
			profileWindowMs: expect.any(Number),
			sampledTimeMs: expect.any(Number),
			activeTimeMs: expect.any(Number),
			garbageCollectionTimeMs: expect.any(Number),
			idleTimeMs: expect.any(Number),
			sampleCount: expect.any(Number),
		});
		expect(output.startup.sampleCount).toBeGreaterThanOrEqual(0);
		expect(output.profile).toBe("worker-startup.cpuprofile");
		expect(output.note).toContain("measured locally");
	});

	it("builds and profiles a Worker from cloudflare.config.ts", async () => {
		const publicEntry = resolveCloudflareConfigPublicEntry();
		await seed({
			...Object.fromEntries(
				WRANGLER_FIXTURE_FILES.map((file) => [
					file,
					readFileSync(join(WRANGLER_FIXTURE_ROOT, file), "utf8"),
				])
			),
			"node_modules/cf/package.json": JSON.stringify({
				name: "cf",
				type: "module",
				exports: { "./config": "./config.mjs" },
			}),
			"node_modules/cf/config.mjs": `export * from ${JSON.stringify(
				pathToFileURL(publicEntry).href
			)};\n`,
		});
		symlinkSync(
			join(WRANGLER_FIXTURE_ROOT, "node_modules/wrangler"),
			resolve("node_modules/wrangler"),
			"junction"
		);
		vi.stubEnv("CLOUDFLARE_ENV", undefined);
		vi.stubEnv("WRANGLER_LOG_PATH", resolve(".wrangler/logs"));

		const { exitCode } = await runCf(["workers", "check", "--quiet"]);

		expect(exitCode).toBe(0);
		expect(existsSync("worker-startup.cpuprofile")).toBe(true);
		expect(readProfileUploadMetadata()).toMatchObject({
			bindings: expect.arrayContaining([
				{
					name: "MY_VAR",
					type: "plain_text",
					text: "Default var",
				},
			]),
		});
	});

	it("preserves a nested entrypoint path when resolving relative modules", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				mainModule: "worker/index.js",
				modules: {
					"worker/index.js": { type: "esm" },
					"worker/helper.js": { type: "esm" },
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/worker/index.js":
				'import { message } from "./helper.js"; export default { fetch() { return new Response(message); } };',
			".cloudflare/output/v0/workers/default/bundle/worker/helper.js":
				'export const message = "ok";',
		});

		const { exitCode } = await runCf([
			"workers",
			"check",
			"--prebuilt",
			"--quiet",
		]);

		expect(exitCode).toBe(0);
		expect(existsSync("worker-startup.cpuprofile")).toBe(true);
		expect(readProfileUploadMetadata()).toMatchObject({
			main_module: "worker/index.js",
		});
	});

	it("makes Build Output bindings available during module evaluation", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				env: {
					STARTUP_TEXT: { type: "text", value: "available" },
					STARTUP_JSON: {
						type: "json",
						value: { enabled: true },
					},
					STARTUP_KV: { type: "kv", id: "startup-kv" },
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js": /* javascript */ `
					import { env } from "cloudflare:workers";
					if (env.STARTUP_TEXT !== "available") {
						throw new Error("Expected STARTUP_TEXT during module evaluation");
					}
					if (typeof env.STARTUP_KV?.get !== "function") {
						throw new Error("Expected STARTUP_KV during module evaluation");
					}
					function ${BINDINGS_AVAILABLE_FUNCTION}() {
						let marker = 0;
						for (let index = 0; index < ${PROFILE_MARKER_ITERATIONS}; index++) {
							marker = Math.imul(marker ^ index, 0x45d9f3b);
						}
						return marker;
					}
					export const bindingsAvailableMarker = ${BINDINGS_AVAILABLE_FUNCTION}();
					export default { fetch() { return new Response("ok"); } };
				`,
		});

		const analyseBundle = vi.mocked(startupProfile.analyseBundle);
		const { exitCode } = await runCf([
			"workers",
			"check",
			"--prebuilt",
			"--quiet",
		]);

		expect(exitCode).toBe(0);
		expect(analyseBundle).toHaveBeenCalledOnce();
		const metadata = readProfileUploadMetadata() as {
			bindings: unknown[];
		};
		expect(metadata.bindings).toEqual(
			expect.arrayContaining([
				{ name: "STARTUP_TEXT", type: "plain_text", text: "available" },
				{
					name: "STARTUP_JSON",
					type: "json",
					json: { enabled: true },
				},
				{
					name: "STARTUP_KV",
					type: "kv_namespace",
					namespace_id: "startup-kv",
				},
			])
		);
		const profile = JSON.parse(
			await readFile("worker-startup.cpuprofile", "utf8")
		) as StartupProfile;
		expect(
			profile.nodes.map(({ callFrame }) => callFrame.functionName)
		).toContain(BINDINGS_AVAILABLE_FUNCTION);
	});

	it("uses existing build output and writes a custom outfile", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: false, mode: "staging" },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"console.log('startup log'); export default { fetch() { return new Response('ok'); } };",
		});

		const { exitCode } = await runCf([
			"workers",
			"check",
			"--prebuilt",
			"--mode",
			"staging",
			"--outfile",
			"custom.cpuprofile",
			"--quiet",
		]);

		expect(exitCode).toBe(0);
		expect(buildDelegateWasCalled()).toBe(false);
		expect(std.out).toBe("");
		expect(existsSync("worker-startup.cpuprofile")).toBe(false);
		const profile = JSON.parse(
			await readFile("custom.cpuprofile", "utf8")
		) as StartupProfile;
		expect(profile.nodes.length).toBeGreaterThan(0);
		expect(profile.startTime).toEqual(expect.any(Number));
		expect(profile.endTime).toEqual(expect.any(Number));
	});

	it("checks prebuilt output with a recorded mode without --mode", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig({
				buildContext: { isPreview: false, mode: "staging" },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } };",
		});

		const { exitCode } = await runCf(["workers", "check", "--prebuilt"]);

		expect(exitCode).toBe(0);
		expect(buildDelegateWasCalled()).toBe(false);
		expect(startupProfile.analyseBundle).toHaveBeenCalledOnce();
	});

	it("profiles the Worker selected by --worker", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				workerConfig(),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('ok'); } };",
			".cloudflare/output/v0/workers/api/worker.config.json": workerConfig({
				name: "api",
				mainModule: "api.js",
				modules: { "api.js": { type: "esm" } },
			}),
			".cloudflare/output/v0/workers/api/bundle/api.js":
				"export default { fetch() { return new Response('api'); } };",
		});

		const { exitCode } = await runCf([
			"workers",
			"check",
			"--prebuilt",
			"--worker",
			"api",
			"--quiet",
		]);

		expect(exitCode).toBe(0);
		expect(readProfileUploadMetadata().main_module).toBe("api.js");
	});

	it("rejects assets-only build output", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				mainModule: undefined,
				modules: undefined,
			}),
			".cloudflare/output/v0/workers/default/assets/index.html":
				"<h1>Hello</h1>",
		});

		await expect(runCf(["workers", "check", "--prebuilt"])).rejects.toThrow(
			"Startup profiling requires a Worker entrypoint; assets-only projects cannot be profiled."
		);
		expect(existsSync("worker-startup.cpuprofile")).toBe(false);
	});

	it("rejects service-worker format build output", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				mainModule: "index.cjs",
				modules: {
					"index.cjs": { type: "cjs" },
					"helper.cjs": { type: "cjs" },
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/index.cjs":
				'const { message } = require("./helper.cjs"); addEventListener("fetch", (event) => event.respondWith(new Response(message)));',
			".cloudflare/output/v0/workers/default/bundle/helper.cjs":
				'module.exports = { message: "ok" };',
		});

		await expect(runCf(["workers", "check", "--prebuilt"])).rejects.toThrow(
			"Startup profiling does not support service-worker format Workers. Refer to https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/ for migration guidance."
		);
		expect(startupProfile.analyseBundle).not.toHaveBeenCalled();
		expect(existsSync("worker-startup.cpuprofile")).toBe(false);
	});

	it("rejects local mode before building", async () => {
		await expect(
			runCf(["workers", "check", "--local", "--persist-to", "state"])
		).rejects.toThrow("--local is not supported by cf workers check.");
		expect(buildDelegateWasCalled()).toBe(false);
	});
});

function resolveCloudflareConfigPublicEntry(): string {
	const packageRoot = resolve(
		__dirname,
		"../../../node_modules/@cloudflare/config"
	);
	const packageJson = JSON.parse(
		readFileSync(join(packageRoot, "package.json"), "utf8")
	) as { exports: { "./public": { import: string } } };
	return join(packageRoot, packageJson.exports["./public"].import);
}
