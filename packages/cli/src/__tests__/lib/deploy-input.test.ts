import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
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
			".cloudflare/output/v1/config.json": buildOutputRootConfig(),
			".cloudflare/output/v1/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				modules: {
					"index.js": { type: "esm" },
					"helper.wasm": { type: "wasm" },
				},
			}),
			".cloudflare/output/v1/workers/default/bundle/index.js":
				"export default {}",
			".cloudflare/output/v1/workers/default/bundle/helper.wasm": "wasm-bytes",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);
		const result = assembleBuildResult(worker, builtConfig, process.cwd());

		expect(result.resolvedEntryPointPath).toBe(
			resolve(".cloudflare/output/v1/workers/default/bundle/index.js")
		);
		expect(result.bundleType).toBe("esm");
		expect(result.content).toBe("export default {}");
		expect(result.modules).toHaveLength(1);
		expect(result.modules[0]?.name).toBe("helper.wasm");
		expect(result.modules[0]?.type).toBe("compiled-wasm");
		expect(Object.keys(result.dependencies)).toHaveLength(2);
	});

	it("resolves and deploys modules from a partial manifest", async () => {
		await seed({
			".cloudflare/output/v1/config.json": buildOutputRootConfig(),
			".cloudflare/output/v1/workers/default/worker.config.json":
				JSON.stringify({
					name: "my-worker",
					compatibilityDate: "2026-04-25",
					manifest: {
						type: "partial",
						mainModule: "index.js",
						modules: { "helper.wasm": { type: "wasm" } },
					},
				}),
			".cloudflare/output/v1/workers/default/bundle/index.js":
				"export default {}",
			".cloudflare/output/v1/workers/default/bundle/chunk.mjs":
				"export const value = 1",
			".cloudflare/output/v1/workers/default/bundle/chunk.mjs.map": "{}",
			".cloudflare/output/v1/workers/default/bundle/helper.wasm": "wasm-bytes",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);
		const result = assembleBuildResult(worker, builtConfig, process.cwd());

		expect(builtConfig.manifest?.type).toBe("complete");
		expect(result.modules).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: "chunk.mjs", type: "esm" }),
				expect.objectContaining({
					name: "helper.wasm",
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
			".cloudflare/output/v1/config.json": buildOutputRootConfig(),
			".cloudflare/output/v1/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				modules: {
					"index.js": { type: "esm" },
					"index.js.map": { type: "sourcemap" },
				},
			}),
			".cloudflare/output/v1/workers/default/bundle/index.js":
				"export default {}",
			".cloudflare/output/v1/workers/default/bundle/index.js.map":
				'{"version":3}',
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);
		const result = assembleBuildResult(worker, builtConfig, process.cwd());
		expect(result.sourceMaps).toHaveLength(1);
		expect(result.sourceMaps?.[0]?.name).toBe("index.js.map");
		expect(result.sourceMaps?.[0]?.content).toBe('{"version":3}');
		expect(result.modules).toHaveLength(0);
	});

	describe("source map sources", () => {
		const up = (levels: number) => "../".repeat(levels);

		// Mirrors the Vite plugin, whose partial manifest leaves source maps to be
		// inferred from the bundle directory.
		async function uploadSourceMap(
			map: Record<string, unknown>,
			mapKey = "index.js.map"
		) {
			const bundle = ".cloudflare/output/v1/workers/default/bundle";
			await seed({
				".cloudflare/output/v1/config.json": buildOutputRootConfig(),
				".cloudflare/output/v1/workers/default/worker.config.json":
					JSON.stringify({
						name: "my-worker",
						compatibilityDate: "2026-04-25",
						manifest: { type: "partial", mainModule: "index.js", modules: {} },
					}),
				[`${bundle}/index.js`]: "export default {}",
				[`${bundle}/${mapKey}`]: JSON.stringify(map),
			});

			const {
				root,
				rootConfig,
				workers: { default: worker },
			} = await readBuildOutput(process.cwd());
			const { builtConfig } = parseWorkerConfig(worker, rootConfig);
			const result = assembleBuildResult(worker, builtConfig, root);
			const sourceMap = result.sourceMaps?.find(({ name }) => name === mapKey);
			return JSON.parse(String(sourceMap?.content));
		}

		it("rewrites sources relative to the project root", async () => {
			const map = {
				version: 3,
				file: "index.js",
				sources: [
					`${up(6)}node_modules/itty-router/index.mjs`,
					`${up(6)}src/index.ts`,
				],
				sourcesContent: ["export const Router = 1", "export default {}"],
				names: ["Router"],
				mappings: "AAAA",
			};

			expect(await uploadSourceMap(map)).toEqual({
				...map,
				sources: ["node_modules/itty-router/index.mjs", "src/index.ts"],
			});
		});

		it("resolves sources from the map's own directory", async () => {
			const result = await uploadSourceMap(
				{ version: 3, sources: [`${up(7)}src/lazy.ts`], mappings: "" },
				"assets/lazy.js.map"
			);
			expect(result.sources).toEqual(["src/lazy.ts"]);
		});

		it("keeps the parent path of a source outside the project", async () => {
			const result = await uploadSourceMap({
				version: 3,
				sources: [`${up(8)}shared/index.ts`],
				mappings: "",
			});
			expect(result.sources).toEqual(["../../shared/index.ts"]);
		});

		it("applies and removes sourceRoot", async () => {
			const result = await uploadSourceMap({
				version: 3,
				sourceRoot: `${up(6)}src/`,
				sources: ["index.ts"],
				mappings: "",
			});
			expect(result.sources).toEqual(["src/index.ts"]);
			expect(result).not.toHaveProperty("sourceRoot");
		});

		it("makes absolute sources project-relative", async () => {
			const result = await uploadSourceMap({
				version: 3,
				sources: [resolve("src/index.ts")],
				mappings: "",
			});
			expect(result.sources).toEqual(["src/index.ts"]);
		});

		it("makes file URL sources project-relative", async () => {
			const result = await uploadSourceMap({
				version: 3,
				sources: [pathToFileURL(resolve("src/index.ts")).href],
				mappings: "",
			});
			expect(result.sources).toEqual(["src/index.ts"]);
		});

		it("applies and removes a file URL sourceRoot", async () => {
			const result = await uploadSourceMap({
				version: 3,
				sourceRoot: `${pathToFileURL(resolve("src")).href}/`,
				sources: ["index.ts", "lib/greet.ts"],
				mappings: "",
			});
			expect(result.sources).toEqual(["src/index.ts", "src/lib/greet.ts"]);
			expect(result).not.toHaveProperty("sourceRoot");
		});

		it.runIf(process.platform !== "win32")(
			"leaves a file URL with a host unchanged",
			async () => {
				const source = "file://build-host/src/index.ts";
				const result = await uploadSourceMap({
					version: 3,
					sources: [source],
					mappings: "",
				});
				expect(result.sources).toEqual([source]);
			}
		);

		it("resolves sources next to the map like any other", async () => {
			const result = await uploadSourceMap({
				version: 3,
				sources: ["index.src.js"],
				mappings: "",
			});
			expect(result.sources).toEqual([
				".cloudflare/output/v1/workers/default/bundle/index.src.js",
			]);
		});

		it("leaves other URLs unchanged", async () => {
			const sources = [
				"webpack://app/./src/index.ts",
				"node:buffer",
				"//cdn.example.com/src/index.ts",
			];
			const result = await uploadSourceMap({
				version: 3,
				sources,
				mappings: "",
			});
			expect(result.sources).toEqual(sources);
		});

		it.each(["webpack://app/", "//cdn.example.com/src/"])(
			"leaves a map with the URL sourceRoot %s unchanged",
			async (sourceRoot) => {
				const map = {
					version: 3,
					sourceRoot,
					sources: ["../src/index.ts"],
					mappings: "",
				};
				expect(await uploadSourceMap(map)).toEqual(map);
			}
		);

		it.runIf(process.platform === "win32")(
			"resolves sources with Windows separators",
			async () => {
				const result = await uploadSourceMap({
					version: 3,
					sources: [`${"..\\".repeat(6)}src\\index.ts`],
					mappings: "",
				});
				expect(result.sources).toEqual(["src/index.ts"]);
			}
		);
	});

	it("uploads a source map it cannot parse unchanged", async () => {
		await seed({
			".cloudflare/output/v1/config.json": buildOutputRootConfig(),
			".cloudflare/output/v1/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				modules: {
					"index.js": { type: "esm" },
					"index.js.map": { type: "sourcemap" },
				},
			}),
			".cloudflare/output/v1/workers/default/bundle/index.js":
				"export default {}",
			".cloudflare/output/v1/workers/default/bundle/index.js.map":
				'{"sources": ["../src/index.ts"',
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);
		const result = assembleBuildResult(worker, builtConfig, process.cwd());
		expect(result.sourceMaps?.[0]?.content).toBe(
			'{"sources": ["../src/index.ts"'
		);
	});

	it("throws when a manifest sourcemap is missing", async () => {
		await seed({
			".cloudflare/output/v1/config.json": buildOutputRootConfig(),
			".cloudflare/output/v1/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				modules: {
					"index.js": { type: "esm" },
					"index.js.map": { type: "sourcemap" },
				},
			}),
			".cloudflare/output/v1/workers/default/bundle/index.js":
				"export default {}",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);
		expect(() =>
			assembleBuildResult(worker, builtConfig, process.cwd())
		).toThrow(BuildOutputConfigError);
		expect(() =>
			assembleBuildResult(worker, builtConfig, process.cwd())
		).toThrow("Module not found:");
	});

	it("returns empty result for assets-only (no mainModule)", async () => {
		await seed({
			".cloudflare/output/v1/config.json": buildOutputRootConfig(),
			".cloudflare/output/v1/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				mainModule: undefined,
				modules: undefined,
			}),
			".cloudflare/output/v1/workers/default/assets/index.html": "",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);
		const result = assembleBuildResult(worker, builtConfig, process.cwd());
		expect(result.resolvedEntryPointPath).toBe("");
		expect(result.modules).toHaveLength(0);
		expect(result.content).toBe("");
	});

	it("rejects module path traversal", async () => {
		await seed({
			".cloudflare/output/v1/config.json": buildOutputRootConfig(),
			".cloudflare/output/v1/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				mainModule: "../../../etc/passwd",
				modules: { "../../../etc/passwd": { type: "esm" } },
			}),
			".cloudflare/output/v1/workers/default/bundle/index.js": "",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);

		expect(() =>
			assembleBuildResult(worker, builtConfig, process.cwd())
		).toThrow(BuildOutputConfigError);
		expect(() =>
			assembleBuildResult(worker, builtConfig, process.cwd())
		).toThrow("escapes the bundle directory");
	});

	it("rejects sibling-prefix path traversal", async () => {
		// "../bundle-evil/payload.js" resolves to a sibling directory that
		// shares the "bundle" prefix. Without the trailing-separator check
		// this would pass a naive startsWith guard.
		await seed({
			".cloudflare/output/v1/config.json": buildOutputRootConfig(),
			".cloudflare/output/v1/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				modules: {
					"index.js": { type: "esm" },
					"../bundle-evil/payload.js": { type: "esm" },
				},
			}),
			".cloudflare/output/v1/workers/default/bundle/index.js":
				"export default {}",
			".cloudflare/output/v1/workers/default/bundle-evil/payload.js": "evil()",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);

		expect(() =>
			assembleBuildResult(worker, builtConfig, process.cwd())
		).toThrow(BuildOutputConfigError);
		expect(() =>
			assembleBuildResult(worker, builtConfig, process.cwd())
		).toThrow("escapes the bundle directory");
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
			".cloudflare/output/v1/config.json": buildOutputRootConfig(),
			".cloudflare/output/v1/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				modules,
			}),
			".cloudflare/output/v1/workers/default/bundle/index.js":
				"export default {}",
			".cloudflare/output/v1/workers/default/bundle/lib.cjs":
				"module.exports = {}",
			".cloudflare/output/v1/workers/default/bundle/app.py": "pass",
			".cloudflare/output/v1/workers/default/bundle/dep.txt": "hello",
			".cloudflare/output/v1/workers/default/bundle/blob.bin": "\x00",
			".cloudflare/output/v1/workers/default/bundle/config.json": '{"a":1}',
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);

		const result = assembleBuildResult(worker, builtConfig, process.cwd());

		const typeMap = Object.fromEntries(
			result.modules.map((m) => [m.name, m.type])
		);
		expect(typeMap["lib.cjs"]).toBe("commonjs");
		expect(typeMap["app.py"]).toBe("python");
		expect(typeMap["dep.txt"]).toBe("text");
		expect(typeMap["blob.bin"]).toBe("buffer");
		expect(typeMap["config.json"]).toBe("text");
	});

	it("keeps Python vendored module paths exactly as in the manifest", async () => {
		// Python Workers import vendored packages from `python_modules/` and use
		// module names as file paths, so a `./` prefix makes `import workers` fail.
		await seed({
			".cloudflare/output/v1/config.json": buildOutputRootConfig(),
			".cloudflare/output/v1/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				compatibilityFlags: ["python_workers"],
				mainModule: "entry.py",
				modules: {
					"entry.py": { type: "python" },
					"helpers.py": { type: "python" },
					"python_modules/workers/__init__.py": { type: "data" },
					"python_modules/_workers_sdk_patch_loader.pth": { type: "data" },
					"python_modules/workers/workflows.js": { type: "esm" },
				},
			}),
			".cloudflare/output/v1/workers/default/bundle/entry.py":
				"from workers import WorkerEntrypoint",
			".cloudflare/output/v1/workers/default/bundle/helpers.py": "pass",
			".cloudflare/output/v1/workers/default/bundle/python_modules/workers/__init__.py":
				"",
			".cloudflare/output/v1/workers/default/bundle/python_modules/_workers_sdk_patch_loader.pth":
				"",
			".cloudflare/output/v1/workers/default/bundle/python_modules/workers/workflows.js":
				"export {}",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { builtConfig } = parseWorkerConfig(worker, rootConfig);
		const result = assembleBuildResult(worker, builtConfig, process.cwd());

		expect(result.bundleType).toBe("python");
		expect(result.modules.map((m) => m.name).sort()).toEqual([
			"helpers.py",
			"python_modules/_workers_sdk_patch_loader.pth",
			"python_modules/workers/__init__.py",
			"python_modules/workers/workflows.js",
		]);
	});

	it("throws when run_worker_first is set without a user Worker", async () => {
		await seed({
			".cloudflare/output/v1/config.json": buildOutputRootConfig(),
			".cloudflare/output/v1/workers/default/worker.config.json": workerConfig({
				name: "my-worker",
				mainModule: undefined,
				modules: undefined,
				assets: { runWorkerFirst: true },
			}),
			".cloudflare/output/v1/workers/default/assets/index.html": "",
		});

		const {
			rootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { wranglerConfig } = parseWorkerConfig(worker, rootConfig);

		const argv: DeployArgs = {
			directory: undefined,
			provision: true,
			worker: undefined,
			"dispatch-namespace": undefined,
			"containers-rollout": undefined,
			"dry-run": false,
			"secrets-file": undefined,
			prebuilt: false,
			force: false,
			quiet: false,
			"temporary-account": false,
			"event-code": undefined,
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
