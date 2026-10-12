import { resolve } from "node:path";
import { readBuildOutput } from "@cloudflare/build-output-utils";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vite-plus/test";
import {
	BuildOutputConfigError,
	parseWorkerConfig,
} from "../../lib/build-output.js";
import {
	assembleBuildResult,
	createDeployProps,
} from "../../lib/deploy-input.js";
import {
	buildOutputRootConfig,
	workerConfig,
} from "../commands/deploy/helpers.js";
import type { DeployArgs } from "../../commands/deploy/index.js";

describe("transforms Build Output Specification into deploy input", () => {
	runInTempDir();

	it("reads modules and maps types", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				modules: {
					"index.js": { type: "esm" },
					"helper.wasm": { type: "wasm" },
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default {}",
			".cloudflare/output/v0/workers/default/bundle/helper.wasm": "wasm-bytes",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);
		const result = assembleBuildResult(worker, builtConfig);

		expect(result.resolvedEntryPointPath).toBe(
			resolve(".cloudflare/output/v0/workers/default/bundle/index.js")
		);
		expect(result.bundleType).toBe("esm");
		expect(result.content).toBe("export default {}");
		expect(result.modules).toHaveLength(1);
		expect(result.modules[0]?.name).toBe("./helper.wasm");
		expect(result.modules[0]?.type).toBe("compiled-wasm");
		expect(Object.keys(result.dependencies)).toHaveLength(2);
	});

	it("resolves and deploys modules from a partial manifest", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json":
				JSON.stringify({
					name: "my-worker",
					compatibilityDate: "2026-04-25",
					manifest: {
						type: "partial",
						mainModule: "index.js",
						modules: { "helper.wasm": { type: "wasm" } },
					},
				}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default {}",
			".cloudflare/output/v0/workers/default/bundle/chunk.mjs":
				"export const value = 1",
			".cloudflare/output/v0/workers/default/bundle/chunk.mjs.map": "{}",
			".cloudflare/output/v0/workers/default/bundle/helper.wasm": "wasm-bytes",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);
		const result = assembleBuildResult(worker, builtConfig);

		expect(builtConfig.manifest?.type).toBe("complete");
		expect(result.modules).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: "./chunk.mjs", type: "esm" }),
				expect.objectContaining({
					name: "./helper.wasm",
					type: "compiled-wasm",
				}),
			])
		);
		expect(result.sourceMaps).toEqual([
			expect.objectContaining({ name: "chunk.mjs.map" }),
		]);
	});

	it("includes sourcemaps declared in the manifest", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				modules: {
					"index.js": { type: "esm" },
					"index.js.map": { type: "sourcemap" },
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default {}",
			".cloudflare/output/v0/workers/default/bundle/index.js.map":
				'{"version":3}',
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);
		const result = assembleBuildResult(worker, builtConfig);
		expect(result.sourceMaps).toHaveLength(1);
		expect(result.sourceMaps?.[0]?.name).toBe("index.js.map");
		expect(result.sourceMaps?.[0]?.content).toBe('{"version":3}');
		expect(result.modules).toHaveLength(0);
	});

	it("throws when a manifest sourcemap is missing", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				modules: {
					"index.js": { type: "esm" },
					"index.js.map": { type: "sourcemap" },
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default {}",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);
		expect(() => assembleBuildResult(worker, builtConfig)).toThrow(
			BuildOutputConfigError
		);
		expect(() => assembleBuildResult(worker, builtConfig)).toThrow(
			"Module not found:"
		);
	});

	it("returns empty result for assets-only (no mainModule)", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				mainModule: undefined,
				modules: undefined,
			}),
			".cloudflare/output/v0/workers/default/assets/index.html": "",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);
		const result = assembleBuildResult(worker, builtConfig);
		expect(result.resolvedEntryPointPath).toBe("");
		expect(result.modules).toHaveLength(0);
		expect(result.content).toBe("");
	});

	it("rejects module path traversal", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				mainModule: "../../../etc/passwd",
				modules: { "../../../etc/passwd": { type: "esm" } },
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js": "",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);

		expect(() => assembleBuildResult(worker, builtConfig)).toThrow(
			BuildOutputConfigError
		);
		expect(() => assembleBuildResult(worker, builtConfig)).toThrow(
			"escapes the bundle directory"
		);
	});

	it("rejects sibling-prefix path traversal", async () => {
		// "../bundle-evil/payload.js" resolves to a sibling directory that
		// shares the "bundle" prefix. Without the trailing-separator check
		// this would pass a naive startsWith guard.
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				modules: {
					"index.js": { type: "esm" },
					"../bundle-evil/payload.js": { type: "esm" },
				},
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default {}",
			".cloudflare/output/v0/workers/default/bundle-evil/payload.js": "evil()",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);

		expect(() => assembleBuildResult(worker, builtConfig)).toThrow(
			BuildOutputConfigError
		);
		expect(() => assembleBuildResult(worker, builtConfig)).toThrow(
			"escapes the bundle directory"
		);
	});

	it("maps all module types correctly", async () => {
		const modules: Record<string, { type: string }> = {
			"index.js": { type: "esm" },
			"lib.cjs": { type: "cjs" },
			"app.py": { type: "python" },
			"dep.txt": { type: "text" },
			"blob.bin": { type: "data" },
			"config.json": { type: "json" },
		};

		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				modules,
			}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default {}",
			".cloudflare/output/v0/workers/default/bundle/lib.cjs":
				"module.exports = {}",
			".cloudflare/output/v0/workers/default/bundle/app.py": "pass",
			".cloudflare/output/v0/workers/default/bundle/dep.txt": "hello",
			".cloudflare/output/v0/workers/default/bundle/blob.bin": "\x00",
			".cloudflare/output/v0/workers/default/bundle/config.json": '{"a":1}',
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);

		const result = assembleBuildResult(worker, builtConfig);

		const typeMap = Object.fromEntries(
			result.modules.map((m) => [m.name, m.type])
		);
		expect(typeMap["./lib.cjs"]).toBe("commonjs");
		expect(typeMap["./app.py"]).toBe("python");
		expect(typeMap["./dep.txt"]).toBe("text");
		expect(typeMap["./blob.bin"]).toBe("buffer");
		expect(typeMap["./config.json"]).toBe("text");
	});

	it("throws when run_worker_first is set without a user Worker", async () => {
		await seed({
			".cloudflare/output/v0/config.json": buildOutputRootConfig(),
			".cloudflare/output/v0/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				mainModule: undefined,
				modules: undefined,
				assets: { runWorkerFirst: true },
			}),
			".cloudflare/output/v0/workers/default/assets/index.html": "",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { wranglerConfig } = parseWorkerConfig(worker, rootConfig);

		const argv: DeployArgs = {
			provision: true,
			worker: undefined,
			"dispatch-namespace": undefined,
			"containers-rollout": undefined,
			"dry-run": false,
			"secrets-file": undefined,
			prebuilt: false,
			force: false,
			quiet: false,
			local: false,
			"persist-to": undefined,
			zone: undefined,
			profile: undefined,
			mode: undefined,
			tag: undefined,
			message: undefined,
		};

		expect(() =>
			createDeployProps(worker, wranglerConfig, "acct-123", argv, {
				source: undefined,
				standard: { normalized: [], builtImages: [] },
				durableObjects: { builtImages: [] },
			})
		).toThrow(BuildOutputConfigError);
	});
});
