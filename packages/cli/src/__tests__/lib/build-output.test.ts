import { join, resolve } from "node:path";
import {
	BuildOutputError,
	readBuildOutput,
} from "@cloudflare/build-output-utils";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import {
	BuildOutputConfigError,
	DEPENDENCIES_INSTRUMENTATION_ENV_VAR,
	parseWorkerConfig,
	selectBuildOutputWorker,
	validateBuildOutputMode,
} from "../../lib/build-output.js";

describe("build output", () => {
	runInTempDir();
	const rootConfig = JSON.stringify({ buildContext: { isPreview: false } });

	it("reads the default Worker from the Build Output Specification tree", async () => {
		await seed({
			".cloudflare/output/v0/config.json": rootConfig,
			".cloudflare/output/v0/workers/default/worker.config.json":
				JSON.stringify({
					name: "my-worker",
					compatibilityDate: "2026-04-25",
				}),
			".cloudflare/output/v0/workers/default/bundle/index.js": "",
			".cloudflare/output/v0/workers/additional/worker.config.json":
				JSON.stringify({
					name: "additional-worker",
					compatibilityDate: "2026-04-25",
				}),
			".cloudflare/output/v0/workers/additional/bundle/index.js": "",
		});

		const {
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());

		expect(worker.config.name).toBe("my-worker");
		expect(worker.configPath).toMatch(/worker\.config\.json$/);
		expect(worker.bundleDir).toMatch(/bundle$/);
	});

	it("converts the Worker config to wrangler config", async () => {
		await seed({
			".cloudflare/output/v0/config.json": rootConfig,
			".cloudflare/output/v0/workers/default/worker.config.json":
				JSON.stringify({
					name: "my-worker",
					compatibilityDate: "2026-04-25",
					compatibilityFlags: ["nodejs_compat"],
					manifest: {
						type: "complete",
						mainModule: "index.js",
						modules: { "index.js": { type: "esm" } },
					},
				}),
			".cloudflare/output/v0/workers/default/bundle/index.js": "",
		});

		const {
			rootConfig: parsedRootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { wranglerConfig } = parseWorkerConfig(worker, parsedRootConfig);

		expect(wranglerConfig).toMatchObject({
			name: "my-worker",
			compatibility_date: "2026-04-25",
			compatibility_flags: ["nodejs_compat"],
		});
		expect(wranglerConfig.main).toBe(
			resolve(".cloudflare/output/v0/workers/default/bundle/index.js")
		);
	});

	it("keeps Build Output Containers separate from Worker validation", async () => {
		await seed({
			".cloudflare/output/v0/config.json": rootConfig,
			".cloudflare/output/v0/workers/default/worker.config.json":
				JSON.stringify({
					name: "my-worker",
					compatibilityDate: "2026-04-25",
					exports: {
						ContainerDO: {
							type: "durable-object",
							storage: "sqlite",
							container: "api-container",
						},
					},
				}),
			".cloudflare/output/v0/workers/default/bundle/index.js": "",
			".cloudflare/output/v0/containers/api/container.config.json":
				JSON.stringify({
					name: "api-container",
					image: { localReference: "api-container:built-by-wrangler" },
					maxInstances: 1,
				}),
		});

		const {
			rootConfig: parsedRootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { wranglerConfig } = parseWorkerConfig(worker, parsedRootConfig);

		expect(wranglerConfig).not.toHaveProperty("containers");
		expect(wranglerConfig.exports?.ContainerDO).toMatchObject({
			type: "durable-object",
			container: "api-container",
		});
	});

	it("reads output mode without including it in converted config", async () => {
		await seed({
			".cloudflare/output/v0/config.json": JSON.stringify({
				accountId: "account-1",
				complianceRegion: "fedramp-high",
				buildContext: { isPreview: false, mode: "staging" },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json":
				JSON.stringify({
					name: "my-worker",
					compatibilityDate: "2026-04-25",
				}),
			".cloudflare/output/v0/workers/default/bundle/index.js": "",
		});

		const {
			rootConfig: parsedRootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { wranglerConfig } = parseWorkerConfig(worker, parsedRootConfig);

		expect(parsedRootConfig.buildContext.mode).toBe("staging");
		expect(wranglerConfig).toMatchObject({
			account_id: "account-1",
			compliance_region: "fedramp_high",
		});
		expect(wranglerConfig).not.toHaveProperty("mode");
	});

	describe("mode validation", () => {
		it.each([
			{
				case: "neither a requested nor built mode",
				requestedMode: undefined,
				builtMode: undefined,
			},
			{
				case: "a built mode without a requested mode",
				requestedMode: undefined,
				builtMode: "production",
			},
			{
				case: "matching requested and built modes",
				requestedMode: "staging",
				builtMode: "staging",
			},
		])("accepts $case", ({ requestedMode, builtMode }) => {
			expect(() =>
				validateBuildOutputMode(requestedMode, builtMode)
			).not.toThrow();
		});

		it("rejects a different built mode", () => {
			expect(() =>
				validateBuildOutputMode("staging", "production")
			).toThrowError(
				new BuildOutputConfigError(
					'The Build Output was created with mode "production", but this command requested mode "staging". To use the existing Build Output, rerun with "--mode production". To deploy in staging mode, rebuild with "--mode staging" before deploying.'
				)
			);
		});

		it("rejects Build Output without a recorded mode", () => {
			expect(() => validateBuildOutputMode("staging", undefined)).toThrowError(
				new BuildOutputConfigError(
					'The Build Output does not record which mode it was created with, but this command requested mode "staging". Rebuild with "--mode staging" before deploying.'
				)
			);
		});
	});

	describe("worker selection", () => {
		async function seedWorkers(workers: Record<string, string>) {
			await seed({
				".cloudflare/output/v0/config.json": rootConfig,
				...Object.fromEntries(
					Object.entries(workers).flatMap(([directory, name]) => [
						[
							`.cloudflare/output/v0/workers/${directory}/worker.config.json`,
							JSON.stringify({ name, compatibilityDate: "2026-04-25" }),
						],
						[`.cloudflare/output/v0/workers/${directory}/bundle/index.js`, ""],
					])
				),
			});
			return (await readBuildOutput(process.cwd())).workers;
		}

		it.each([
			{ case: "no name", requested: undefined, expected: "my-worker" },
			{
				case: "an additional Worker's name",
				requested: "api",
				expected: "api",
			},
			{
				case: "the default Worker's name",
				requested: "my-worker",
				expected: "my-worker",
			},
		])("selects a Worker given $case", async ({ requested, expected }) => {
			const workers = await seedWorkers({ default: "my-worker", api: "api" });

			expect(selectBuildOutputWorker(workers, requested).config.name).toBe(
				expected
			);
		});

		it.each(["missing", "API", "constructor"])(
			"rejects %s with the available Workers",
			async (requested) => {
				const workers = await seedWorkers({ default: "my-worker", api: "api" });

				expect(() => selectBuildOutputWorker(workers, requested)).toThrowError(
					new BuildOutputConfigError(
						`The Build Output has no Worker named "${requested}". Available Workers: my-worker (default), api.`
					)
				);
			}
		);

		it("rejects a name shared by more than one Worker", async () => {
			const workers = await seedWorkers({ default: "api", api: "api" });

			expect(() => selectBuildOutputWorker(workers, "api")).toThrowError(
				new BuildOutputConfigError(
					'The Build Output contains more than one Worker named "api".'
				)
			);
		});
	});

	it("normalizes wrangler config with built and user path", async () => {
		await seed({
			".cloudflare/output/v0/config.json": rootConfig,
			".cloudflare/output/v0/workers/default/worker.config.json":
				JSON.stringify({
					name: "my-worker",
					compatibilityDate: "2026-04-25",
					manifest: {
						type: "complete",
						mainModule: "index.js",
						modules: { "index.js": { type: "esm" } },
					},
				}),
			".cloudflare/output/v0/workers/default/bundle/index.js": "",
		});

		const {
			rootConfig: parsedRootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());
		const { wranglerConfig } = parseWorkerConfig(worker, parsedRootConfig);
		expect(wranglerConfig.name).toBe("my-worker");
		expect(wranglerConfig.configPath).toBe(worker.configPath);
		expect(wranglerConfig.userConfigPath).toBe(
			join(process.cwd(), "cloudflare.config.ts")
		);
	});

	it("rejects a schema-invalid Worker config while reading", async () => {
		await seed({
			".cloudflare/output/v0/config.json": rootConfig,
			".cloudflare/output/v0/workers/default/worker.config.json":
				JSON.stringify({
					name: "my-worker",
					main: "bundle/index.js",
				}),
			".cloudflare/output/v0/workers/default/bundle/index.js": "",
		});

		await expect(readBuildOutput(process.cwd())).rejects.toThrow(
			BuildOutputError
		);
	});

	it("converts normalization diagnostics errors to config errors", async () => {
		await seed({
			".cloudflare/output/v0/config.json": rootConfig,
			".cloudflare/output/v0/workers/default/worker.config.json":
				JSON.stringify({
					name: "bad name!",
					compatibilityDate: "2026-04-25",
					manifest: {
						type: "complete",
						mainModule: "index.js",
						modules: { "index.js": { type: "esm" } },
					},
				}),
			".cloudflare/output/v0/workers/default/bundle/index.js": "",
		});

		const {
			rootConfig: parsedRootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());

		expect(() => parseWorkerConfig(worker, parsedRootConfig)).toThrow(
			BuildOutputConfigError
		);
	});

	describe("dependencies instrumentation env opt-out", () => {
		afterEach(() => {
			vi.unstubAllEnvs();
		});

		async function parseSeededWorker() {
			await seed({
				".cloudflare/output/v0/config.json": rootConfig,
				".cloudflare/output/v0/workers/default/worker.config.json":
					JSON.stringify({
						name: "my-worker",
						compatibilityDate: "2026-04-25",
					}),
				".cloudflare/output/v0/workers/default/bundle/index.js": "",
			});

			const {
				rootConfig: parsedRootConfig,
				workers: { default: worker },
			} = await readBuildOutput(process.cwd());
			return parseWorkerConfig(worker, parsedRootConfig);
		}

		it("leaves instrumentation unset when the env var is absent", async () => {
			vi.stubEnv(DEPENDENCIES_INSTRUMENTATION_ENV_VAR, undefined);

			const { wranglerConfig } = await parseSeededWorker();

			expect(wranglerConfig.dependencies_instrumentation).toBeUndefined();
		});

		it.each(["false", "0", "no", "FALSE", "False"])(
			"disables instrumentation when the env var is %s",
			async (value) => {
				vi.stubEnv(DEPENDENCIES_INSTRUMENTATION_ENV_VAR, value);

				const { wranglerConfig } = await parseSeededWorker();

				expect(wranglerConfig.dependencies_instrumentation).toEqual({
					enabled: false,
				});
			}
		);

		it.each(["true", "1", "yes"])(
			"enables instrumentation when the env var is %s",
			async (value) => {
				vi.stubEnv(DEPENDENCIES_INSTRUMENTATION_ENV_VAR, value);

				const { wranglerConfig } = await parseSeededWorker();

				expect(wranglerConfig.dependencies_instrumentation).toEqual({
					enabled: true,
				});
			}
		);

		it("rejects an unrecognized value", async () => {
			vi.stubEnv(DEPENDENCIES_INSTRUMENTATION_ENV_VAR, "sometimes");

			await expect(parseSeededWorker()).rejects.toThrow(
				`Invalid ${DEPENDENCIES_INSTRUMENTATION_ENV_VAR} value "sometimes"`
			);
		});
	});
});
