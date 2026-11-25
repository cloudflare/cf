import { join, resolve } from "node:path";
import * as clack from "@clack/prompts";
import {
	BuildOutputError,
	readBuildOutput,
} from "@cloudflare/build-output-utils";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import {
	BuildOutputConfigError,
	applyCIWorkerNameOverride,
	parseWorkerConfig,
	resolveBuildOutputSettings,
	selectBuildOutputWorker,
	validateBuildOutputMode,
} from "../../lib/build-output.js";
import { applyCloudflareDotEnv } from "../../lib/dotenv.js";

describe("build output", () => {
	runInTempDir();
	const rootConfig = JSON.stringify({ buildContext: { isPreview: false } });

	it("reads the default Worker from the Build Output Specification tree", async () => {
		await seed({
			".cloudflare/output/v1/config.json": rootConfig,
			".cloudflare/output/v1/workers/default/worker.config.json":
				JSON.stringify({
					name: "my-worker",
					compatibilityDate: "2026-04-25",
				}),
			".cloudflare/output/v1/workers/default/bundle/index.js": "",
			".cloudflare/output/v1/workers/additional/worker.config.json":
				JSON.stringify({
					name: "additional-worker",
					compatibilityDate: "2026-04-25",
				}),
			".cloudflare/output/v1/workers/additional/bundle/index.js": "",
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
			".cloudflare/output/v1/config.json": rootConfig,
			".cloudflare/output/v1/workers/default/worker.config.json":
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
			".cloudflare/output/v1/workers/default/bundle/index.js": "",
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
			resolve(".cloudflare/output/v1/workers/default/bundle/index.js")
		);
	});

	it("keeps Build Output Containers separate from Worker validation", async () => {
		await seed({
			".cloudflare/output/v1/config.json": rootConfig,
			".cloudflare/output/v1/workers/default/worker.config.json":
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
			".cloudflare/output/v1/workers/default/bundle/index.js": "",
			".cloudflare/output/v1/containers/api/container.config.json":
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
			".cloudflare/output/v1/config.json": JSON.stringify({
				buildContext: { isPreview: false, mode: "staging" },
				settings: {
					accountId: "account-1",
					complianceRegion: "fedramp-high",
				},
			}),
			".cloudflare/output/v1/workers/default/worker.config.json":
				JSON.stringify({
					name: "my-worker",
					compatibilityDate: "2026-04-25",
				}),
			".cloudflare/output/v1/workers/default/bundle/index.js": "",
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
			expect(() => validateBuildOutputMode("staging", "production")).toThrow(
				new BuildOutputConfigError(
					'The Build Output was created with mode "production", but this command requested mode "staging". To use the existing Build Output, rerun with "--mode production". To deploy in staging mode, rebuild with "--mode staging" before deploying.'
				)
			);
		});

		it("rejects Build Output without a recorded mode", () => {
			expect(() => validateBuildOutputMode("staging", undefined)).toThrow(
				new BuildOutputConfigError(
					'The Build Output does not record which mode it was created with, but this command requested mode "staging". Rebuild with "--mode staging" before deploying.'
				)
			);
		});
	});

	describe("settings resolution", () => {
		beforeEach(() => {
			vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
			vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
		});

		it.each([
			{ settings: undefined, temporaryAccount: true },
			{
				settings: { complianceRegion: "public" as const },
				temporaryAccount: true,
			},
			{ settings: { accountId: "account-id" }, temporaryAccount: false },
		])(
			"accepts settings $settings when temporary is $temporaryAccount",
			({ settings, temporaryAccount }) => {
				expect(() =>
					resolveBuildOutputSettings(settings, temporaryAccount)
				).not.toThrow();
			}
		);

		it("rejects a Build Output account with a temporary account", () => {
			expect(() =>
				resolveBuildOutputSettings({ accountId: "account-id" }, true)
			).toThrow(
				new BuildOutputConfigError(
					'The Build Output targets account "account-id", but `--temporary-account` was passed. To deploy to "account-id", remove `--temporary-account`. To deploy to a temporary account, remove `accountId` from your config file, then rebuild.'
				)
			);
		});

		it.each([
			{ settings: {}, env: {}, region: "public" },
			{
				settings: { complianceRegion: "fedramp-high" as const },
				env: {},
				region: "fedramp_high",
			},
			{
				settings: {},
				env: { CLOUDFLARE_COMPLIANCE_REGION: "fedramp_high" },
				region: "fedramp_high",
			},
			{
				settings: {},
				env: { CLOUDFLARE_COMPLIANCE_REGION: "fedramp-high" },
				region: "fedramp_high",
			},
			{
				settings: { complianceRegion: "fedramp-high" as const },
				env: { CLOUDFLARE_COMPLIANCE_REGION: "fedramp_high" },
				region: "fedramp_high",
			},
			{
				settings: { complianceRegion: "public" as const },
				env: { CLOUDFLARE_COMPLIANCE_REGION: "public" },
				region: "public",
			},
			{
				settings: { accountId: "account-id" },
				env: { CLOUDFLARE_ACCOUNT_ID: "account-id" },
				region: "public",
			},
			{
				settings: {},
				env: { CLOUDFLARE_ACCOUNT_ID: "env-account" },
				region: "public",
			},
		])(
			"resolves region $region from settings $settings and env $env",
			({ settings, env, region }) => {
				for (const [name, value] of Object.entries(env)) {
					vi.stubEnv(name, value);
				}

				expect(resolveBuildOutputSettings(settings, false)).toEqual({
					complianceRegion: region,
				});
			}
		);

		it.each([{}, { complianceRegion: "public" as const }])(
			"rejects an invalid CLOUDFLARE_COMPLIANCE_REGION with settings %o",
			(settings) => {
				vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "invalid");

				expect(() => resolveBuildOutputSettings(settings, false)).toThrow(
					'Invalid compliance region "invalid" from CLOUDFLARE_COMPLIANCE_REGION. Valid values are: public, fedramp_high'
				);
			}
		);

		it.each([
			{
				settings: { accountId: "account-id" },
				name: "CLOUDFLARE_ACCOUNT_ID",
				value: "env-account",
				message:
					'The Build Output targets account "account-id", but `CLOUDFLARE_ACCOUNT_ID` is "env-account" in your environment. To deploy to "account-id", unset it. To deploy to "env-account", set `accountId` to "env-account" in your config file or remove it, then rebuild.',
			},
			{
				settings: { complianceRegion: "fedramp-high" as const },
				name: "CLOUDFLARE_COMPLIANCE_REGION",
				value: "public",
				message:
					'The Build Output targets compliance region "fedramp-high", but `CLOUDFLARE_COMPLIANCE_REGION` is "public" in your environment. To deploy to "fedramp-high", unset it. To deploy to "public", set `complianceRegion` to "public" in your config file or remove it, then rebuild.',
			},
			{
				settings: { complianceRegion: "public" as const },
				name: "CLOUDFLARE_COMPLIANCE_REGION",
				value: "fedramp_high",
				message:
					'The Build Output targets compliance region "public", but `CLOUDFLARE_COMPLIANCE_REGION` is "fedramp_high" in your environment. To deploy to "public", unset it. To deploy to "fedramp-high", set `complianceRegion` to "fedramp-high" in your config file or remove it, then rebuild.',
			},
		])(
			"rejects a different $name from the environment",
			({ settings, name, value, message }) => {
				vi.stubEnv(name, value);

				expect(() => resolveBuildOutputSettings(settings, false)).toThrow(
					new BuildOutputConfigError(message)
				);
			}
		);

		it("names the dotenv file that set a different value", async () => {
			await seed({
				".env.staging": "CLOUDFLARE_COMPLIANCE_REGION=public",
			});
			const restore = await applyCloudflareDotEnv({ mode: "staging" });
			try {
				expect(() =>
					resolveBuildOutputSettings(
						{ accountId: "account-id", complianceRegion: "fedramp-high" },
						false
					)
				).toThrow(
					new BuildOutputConfigError(
						'The Build Output targets compliance region "fedramp-high", but `CLOUDFLARE_COMPLIANCE_REGION` is "public" in .env.staging. To deploy to "fedramp-high", remove it from .env.staging. To deploy to "public", set `complianceRegion` to "public" in your config file or remove it, then rebuild.'
					)
				);
			} finally {
				restore();
			}
		});
	});

	describe("worker selection", () => {
		async function seedWorkers(workers: Record<string, string>) {
			await seed({
				".cloudflare/output/v1/config.json": rootConfig,
				...Object.fromEntries(
					Object.entries(workers).flatMap(([directory, name]) => [
						[
							`.cloudflare/output/v1/workers/${directory}/worker.config.json`,
							JSON.stringify({ name, compatibilityDate: "2026-04-25" }),
						],
						[`.cloudflare/output/v1/workers/${directory}/bundle/index.js`, ""],
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

				expect(() => selectBuildOutputWorker(workers, requested)).toThrow(
					new BuildOutputConfigError(
						`The Build Output has no Worker named "${requested}". Available Workers: my-worker (default), api.`
					)
				);
			}
		);

		describe("CLOUDFLARE_CI_OVERRIDE_WORKER_NAME", () => {
			afterEach(() => vi.restoreAllMocks());

			it("renames only the given Worker and warns", async () => {
				vi.stubEnv("CLOUDFLARE_CI_OVERRIDE_WORKER_NAME", "dashboard-worker");
				const warn = vi.spyOn(clack.log, "warn").mockImplementation(() => {});
				const workers = await seedWorkers({
					default: "my-worker",
					api: "api",
				});

				const { worker, workerNameOverridden } = applyCIWorkerNameOverride(
					workers.default
				);

				expect(workerNameOverridden).toBe(true);
				expect(worker.config.name).toBe("dashboard-worker");
				expect(worker.config.compatibilityDate).toBe("2026-04-25");
				expect(workers.default.config.name).toBe("my-worker");
				expect(workers.api?.config.name).toBe("api");
				expect(warn).toHaveBeenCalledWith(
					'Failed to match Worker name. Your config file is using the Worker name "my-worker", but the CI system expected "dashboard-worker". Overriding using the CI provided Worker name.',
					expect.anything()
				);
			});

			it.each([undefined, "", "my-worker"])(
				"keeps the configured name without a warning when set to %j",
				async (value) => {
					vi.stubEnv("CLOUDFLARE_CI_OVERRIDE_WORKER_NAME", value);
					const warn = vi.spyOn(clack.log, "warn").mockImplementation(() => {});
					const workers = await seedWorkers({ default: "my-worker" });

					expect(applyCIWorkerNameOverride(workers.default)).toEqual({
						worker: workers.default,
						workerNameOverridden: false,
					});
					expect(warn).not.toHaveBeenCalled();
				}
			);
		});

		it("rejects a name shared by more than one Worker", async () => {
			const workers = await seedWorkers({ default: "api", api: "api" });

			expect(() => selectBuildOutputWorker(workers, "api")).toThrow(
				new BuildOutputConfigError(
					'The Build Output contains more than one Worker named "api".'
				)
			);
		});
	});

	it("normalizes wrangler config with built and user path", async () => {
		await seed({
			".cloudflare/output/v1/config.json": rootConfig,
			".cloudflare/output/v1/workers/default/worker.config.json":
				JSON.stringify({
					name: "my-worker",
					compatibilityDate: "2026-04-25",
					manifest: {
						type: "complete",
						mainModule: "index.js",
						modules: { "index.js": { type: "esm" } },
					},
				}),
			".cloudflare/output/v1/workers/default/bundle/index.js": "",
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
			".cloudflare/output/v1/config.json": rootConfig,
			".cloudflare/output/v1/workers/default/worker.config.json":
				JSON.stringify({
					name: "my-worker",
					main: "bundle/index.js",
				}),
			".cloudflare/output/v1/workers/default/bundle/index.js": "",
		});

		await expect(readBuildOutput(process.cwd())).rejects.toThrow(
			BuildOutputError
		);
	});

	it("converts normalization diagnostics errors to config errors", async () => {
		await seed({
			".cloudflare/output/v1/config.json": rootConfig,
			".cloudflare/output/v1/workers/default/worker.config.json":
				JSON.stringify({
					name: "bad name!",
					compatibilityDate: "2026-04-25",
					manifest: {
						type: "complete",
						mainModule: "index.js",
						modules: { "index.js": { type: "esm" } },
					},
				}),
			".cloudflare/output/v1/workers/default/bundle/index.js": "",
		});

		const {
			rootConfig: parsedRootConfig,
			workers: { default: worker },
		} = await readBuildOutput(process.cwd());

		expect(() => parseWorkerConfig(worker, parsedRootConfig)).toThrow(
			BuildOutputConfigError
		);
	});
});
