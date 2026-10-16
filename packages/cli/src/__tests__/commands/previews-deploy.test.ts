import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { clearOutputFilePath } from "@cloudflare/workers-utils";
import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import {
	createPreviewDeployOutput,
	runPreviewDeploy,
} from "../../commands/previews/deploy.js";
import { runCf } from "../helpers/run-cf.js";
import type * as ContainerModule from "../../commands/deploy/containers.js";
import type * as BuildOutputModule from "../../lib/build-output.js";

const mocks = vi.hoisted(() => ({
	assembleBuildResult: vi.fn(),
	assertPreviewBuildOutputRootConfig: vi.fn(),
	createContainerDeployConfig: vi.fn(),
	createDeployContext: vi.fn(),
	getAccountId: vi.fn(),
	getAuthToken: vi.fn(),
	getBranchName: vi.fn(),
	initDeployHelpersContext: vi.fn(),
	previewBuildOutput: vi.fn(),
	parseWorkerConfig: vi.fn(),
	readBuildOutput: vi.fn(),
	runBuild: vi.fn(),
}));

vi.mock("@cloudflare/build-output-utils", () => ({
	readBuildOutput: mocks.readBuildOutput,
}));

vi.mock("@cloudflare/deploy-helpers", () => ({
	assertPreviewBuildOutputRootConfig: mocks.assertPreviewBuildOutputRootConfig,
	getBranchName: mocks.getBranchName,
	initDeployHelpersContext: mocks.initDeployHelpersContext,
	previewBuildOutput: mocks.previewBuildOutput,
}));

vi.mock("../../lib/auth-token.js", () => ({
	getAuthToken: mocks.getAuthToken,
}));
vi.mock("../../lib/context.js", () => ({
	getAccountId: mocks.getAccountId,
}));

vi.mock("../../lib/deploy-context.js", () => ({
	createDeployContext: mocks.createDeployContext,
}));

vi.mock("../../lib/deploy-input.js", () => ({
	assembleBuildResult: mocks.assembleBuildResult,
}));

vi.mock("../../lib/build-output.js", async (importOriginal) => {
	const actual = await importOriginal<typeof BuildOutputModule>();
	return {
		buildOutputWorkerOption: actual.buildOutputWorkerOption,
		parseWorkerConfig: mocks.parseWorkerConfig,
		selectBuildOutputWorker: actual.selectBuildOutputWorker,
		validateBuildOutputMode: actual.validateBuildOutputMode,
	};
});

vi.mock("../../commands/deploy/containers.js", async (importOriginal) => {
	const actual = await importOriginal<typeof ContainerModule>();
	return {
		...actual,
		createContainerDeployConfig: mocks.createContainerDeployConfig,
	};
});

vi.mock("../../commands/build/index.js", () => ({
	runBuild: mocks.runBuild,
}));

const previewResult = {
	preview: {
		id: "preview-id",
		name: "feature",
		slug: "feature",
		urls: ["https://feature.example.workers.dev"],
		created_on: "2026-01-01T00:00:00Z",
		updated_on: "2026-01-01T00:00:00Z",
	},
	deployment: {
		id: "deployment-id",
		preview_id: "preview-id",
		preview_name: "feature",
		urls: ["https://deployment.example.workers.dev"],
		created_on: "2026-01-01T00:00:00Z",
	},
	isNewPreview: true,
};

describe("cf previews deploy", () => {
	afterEach(() => clearOutputFilePath());
	beforeEach(() => {
		clearOutputFilePath();
		vi.stubEnv("WRANGLER_OUTPUT_FILE_DIRECTORY", undefined);
		vi.stubEnv("WRANGLER_OUTPUT_FILE_PATH", undefined);
		vi.clearAllMocks();
		mocks.parseWorkerConfig.mockImplementation((worker) => ({
			wranglerConfig: worker.config,
			builtConfig: worker.config,
		}));
		mocks.createContainerDeployConfig.mockReturnValue({
			standard: { normalized: [], builtImages: [] },
			durableObjects: { builtImages: [] },
		});
	});

	it("builds and uploads Preview Build Output", async () => {
		const rootConfig = { buildContext: { isPreview: true, mode: "staging" } };
		const worker = {
			config: { type: "worker", name: "preview-worker" },
			bundleDir: "/project/bundle",
			assetsDir: "/project/assets",
		};
		const buildResult = { content: "worker code" };
		mocks.getBranchName.mockReturnValue("feature/preview");
		mocks.readBuildOutput.mockResolvedValue({
			rootConfig,
			workers: { default: worker },
		});
		mocks.assembleBuildResult.mockReturnValue(buildResult);
		mocks.getAuthToken.mockResolvedValue("token");
		mocks.getAccountId.mockResolvedValue("account-id");
		mocks.createDeployContext.mockReturnValue({
			logger: { log: vi.fn(), info: vi.fn() },
		});
		mocks.previewBuildOutput.mockResolvedValue(previewResult);

		await expect(
			runPreviewDeploy({
				mode: "staging",
				"preview-name": "HEAD",
			} as Parameters<typeof runPreviewDeploy>[0])
		).resolves.toBe(previewResult);
		expect(mocks.getBranchName).not.toHaveBeenCalled();

		expect(mocks.runBuild).toHaveBeenCalledWith(
			"staging",
			{ output: "stderr" },
			{ isPreview: true }
		);
		expect(mocks.assertPreviewBuildOutputRootConfig).toHaveBeenCalledWith(
			rootConfig
		);
		expect(mocks.getAccountId).toHaveBeenCalledWith({
			isPreview: true,
			skipProjectSettings: true,
			complianceRegion: "public",
		});
		expect(mocks.createDeployContext).toHaveBeenCalledWith("token");
		expect(mocks.initDeployHelpersContext).toHaveBeenCalledWith(
			expect.objectContaining({
				logger: expect.objectContaining({
					log: expect.any(Function),
					info: expect.any(Function),
				}),
			})
		);
		expect(mocks.previewBuildOutput).toHaveBeenCalledWith(
			"account-id",
			{ name: "HEAD", json: true },
			expect.objectContaining({
				workerConfig: worker.config,
				rootConfig,
				buildResult,
				assets: { directory: "/project/assets" },
			}),
			expect.any(Object)
		);
	});

	it("uploads prebuilt Preview output with a recorded mode without --mode", async () => {
		const rootConfig = {
			accountId: "built-preview-account",
			buildContext: { isPreview: true, mode: "staging" },
		};
		const worker = {
			config: { type: "worker", name: "preview-worker" },
			bundleDir: "/project/bundle",
		};
		mocks.readBuildOutput.mockResolvedValue({
			rootConfig,
			workers: { default: worker },
		});
		mocks.assembleBuildResult.mockReturnValue({ content: "worker code" });
		mocks.getAuthToken.mockResolvedValue("token");
		mocks.getAccountId.mockResolvedValue("account-id");
		mocks.createDeployContext.mockReturnValue({
			logger: { log: vi.fn(), info: vi.fn() },
		});
		mocks.previewBuildOutput.mockResolvedValue(previewResult);

		await expect(
			runPreviewDeploy({
				"preview-name": "feature",
				prebuilt: true,
			} as Parameters<typeof runPreviewDeploy>[0])
		).resolves.toBe(previewResult);

		expect(mocks.runBuild).not.toHaveBeenCalled();
		expect(mocks.getAccountId).not.toHaveBeenCalled();
		expect(mocks.previewBuildOutput).toHaveBeenCalledWith(
			"built-preview-account",
			{ name: "feature", json: true },
			expect.objectContaining({
				workerConfig: worker.config,
				rootConfig,
			}),
			expect.any(Object)
		);
	});

	it("uses the built region to select an account when output omits its ID", async () => {
		const worker = {
			config: {
				type: "worker",
				name: "preview-worker",
				compliance_region: "fedramp_high",
			},
			bundleDir: "/project/bundle",
		};
		mocks.readBuildOutput.mockResolvedValue({
			rootConfig: {
				complianceRegion: "fedramp-high",
				buildContext: { isPreview: true, mode: "staging" },
			},
			workers: { default: worker },
		});
		mocks.assembleBuildResult.mockReturnValue({ content: "worker code" });
		mocks.getAuthToken.mockResolvedValue("token");
		mocks.getAccountId.mockResolvedValue("selected-account");
		mocks.createDeployContext.mockReturnValue({
			logger: { log: vi.fn(), info: vi.fn() },
		});
		mocks.previewBuildOutput.mockResolvedValue(previewResult);

		await runPreviewDeploy({
			"preview-name": "feature",
			prebuilt: true,
		} as Parameters<typeof runPreviewDeploy>[0]);

		expect(mocks.getAccountId).toHaveBeenCalledWith({
			isPreview: true,
			skipProjectSettings: true,
			complianceRegion: "fedramp_high",
		});
		expect(mocks.previewBuildOutput).toHaveBeenCalledWith(
			"selected-account",
			expect.any(Object),
			expect.any(Object),
			expect.any(Object)
		);
	});

	it("builds and uploads the Worker selected by --worker", async () => {
		const rootConfig = { buildContext: { isPreview: true } };
		const api = {
			config: { type: "worker", name: "api" },
			bundleDir: "/project/api/bundle",
		};
		const buildResult = { content: "api code" };
		mocks.readBuildOutput.mockResolvedValue({
			rootConfig,
			workers: {
				default: {
					config: { type: "worker", name: "preview-worker" },
					bundleDir: "/project/bundle",
				},
				api,
			},
		});
		mocks.assembleBuildResult.mockReturnValue(buildResult);
		mocks.getAuthToken.mockResolvedValue("token");
		mocks.getAccountId.mockResolvedValue("account-id");
		mocks.createDeployContext.mockReturnValue({
			logger: { log: vi.fn(), info: vi.fn() },
		});
		mocks.previewBuildOutput.mockResolvedValue(previewResult);

		await expect(
			runCf(["previews", "deploy", "feature", "--worker", "api", "--quiet"])
		).resolves.toEqual({ exitCode: 0 });

		expect(mocks.runBuild).toHaveBeenCalledWith(
			undefined,
			{ output: "silent", worker: "api" },
			{ isPreview: true }
		);
		expect(mocks.assembleBuildResult).toHaveBeenCalledWith(api, api.config);
		expect(mocks.previewBuildOutput).toHaveBeenCalledWith(
			"account-id",
			{ name: "feature", json: true },
			expect.objectContaining({ workerConfig: api.config, buildResult }),
			expect.any(Object)
		);
	});

	it("rejects an unknown --worker before authenticating", async () => {
		mocks.readBuildOutput.mockResolvedValue({
			rootConfig: { buildContext: { isPreview: true } },
			workers: {
				default: { config: { type: "worker", name: "preview-worker" } },
			},
		});

		await expect(
			runPreviewDeploy({
				"preview-name": "feature",
				prebuilt: true,
				worker: "missing",
			} as Parameters<typeof runPreviewDeploy>[0])
		).rejects.toThrow(
			'The Build Output has no Worker named "missing". Available Workers: preview-worker (default).'
		);
		expect(mocks.getAuthToken).not.toHaveBeenCalled();
		expect(mocks.previewBuildOutput).not.toHaveBeenCalled();
	});

	it("passes Build Output Containers to the Preview upload", async () => {
		const rootConfig = { buildContext: { isPreview: true } };
		const worker = {
			config: {
				type: "worker",
				name: "preview-worker",
				exports: {
					ContainerDO: {
						type: "durable-object",
						storage: "sqlite",
						container: "preview-container",
					},
				},
			},
			bundleDir: "/project/bundle",
		};
		const containers = [
			{ name: "preview-container", class_name: "ContainerDO" },
		];
		mocks.readBuildOutput.mockResolvedValue({
			rootConfig,
			workers: { default: worker },
			containers: [{ config: { name: "preview-container" } }],
		});
		mocks.assembleBuildResult.mockReturnValue({ content: "worker code" });
		mocks.getAuthToken.mockResolvedValue("token");
		mocks.getAccountId.mockResolvedValue("account-id");
		mocks.createDeployContext.mockReturnValue({
			logger: { log: vi.fn(), info: vi.fn() },
		});
		mocks.createContainerDeployConfig.mockReturnValue({
			source: containers,
			standard: {
				normalized: [{ name: "preview-container", class_name: "ContainerDO" }],
				builtImages: [],
			},
			durableObjects: { builtImages: [] },
		});
		mocks.previewBuildOutput.mockResolvedValue(previewResult);

		await runPreviewDeploy({
			"preview-name": "feature",
			prebuilt: true,
		} as Parameters<typeof runPreviewDeploy>[0]);

		expect(mocks.previewBuildOutput).toHaveBeenCalledWith(
			"account-id",
			{ name: "feature", json: true },
			expect.objectContaining({
				containers: [{ name: "preview-container" }],
			}),
			expect.any(Object)
		);
	});

	it("uses the inferred branch name", async () => {
		const rootConfig = { buildContext: { isPreview: true } };
		const worker = {
			config: { type: "worker", name: "preview-worker" },
			bundleDir: "/project/bundle",
		};
		mocks.getBranchName.mockReturnValue("feature/preview");
		mocks.readBuildOutput.mockResolvedValue({
			rootConfig,
			workers: { default: worker },
		});
		mocks.assembleBuildResult.mockReturnValue({ content: "worker code" });
		mocks.getAuthToken.mockResolvedValue("token");
		mocks.getAccountId.mockResolvedValue("account-id");
		mocks.createDeployContext.mockReturnValue({
			logger: { log: vi.fn(), info: vi.fn() },
		});
		mocks.previewBuildOutput.mockResolvedValue(previewResult);

		await runPreviewDeploy({} as Parameters<typeof runPreviewDeploy>[0]);

		expect(mocks.previewBuildOutput).toHaveBeenCalledWith(
			"account-id",
			{ name: "feature/preview", json: true },
			expect.any(Object),
			expect.any(Object)
		);
	});

	it("uploads assets-only Build Output", async () => {
		const worker = {
			config: { type: "worker", name: "preview-worker" },
			assetsDir: "/project/assets",
		};
		mocks.readBuildOutput.mockResolvedValue({
			rootConfig: { buildContext: { isPreview: true, mode: "staging" } },
			workers: { default: worker },
		});
		mocks.getAuthToken.mockResolvedValue("token");
		mocks.getAccountId.mockResolvedValue("account-id");
		mocks.createDeployContext.mockReturnValue({
			logger: { log: vi.fn(), info: vi.fn() },
		});
		mocks.previewBuildOutput.mockResolvedValue(previewResult);

		await runPreviewDeploy({
			"preview-name": "feature",
			mode: "staging",
			prebuilt: true,
		} as Parameters<typeof runPreviewDeploy>[0]);

		expect(mocks.previewBuildOutput).toHaveBeenCalledWith(
			"account-id",
			{ name: "feature", json: true },
			expect.objectContaining({
				buildResult: undefined,
				assets: { directory: "/project/assets" },
			}),
			expect.any(Object)
		);
	});

	it("parses Preview deploy flags through the CLI", async () => {
		const worker = {
			config: { type: "worker", name: "preview-worker" },
			bundleDir: "/project/bundle",
		};
		mocks.readBuildOutput.mockResolvedValue({
			rootConfig: { buildContext: { isPreview: true, mode: "staging" } },
			workers: { default: worker },
		});
		mocks.assembleBuildResult.mockReturnValue({ content: "worker code" });
		mocks.getAuthToken.mockResolvedValue("token");
		mocks.getAccountId.mockResolvedValue("account-id");
		mocks.createDeployContext.mockReturnValue({
			logger: { log: vi.fn(), info: vi.fn() },
		});
		mocks.previewBuildOutput.mockResolvedValue(previewResult);

		await expect(
			runCf([
				"previews",
				"deploy",
				"feature",
				"--prebuilt",
				"--mode",
				"staging",
				"--quiet",
			])
		).resolves.toEqual({ exitCode: 0 });
		expect(mocks.runBuild).not.toHaveBeenCalled();
		expect(mocks.previewBuildOutput).toHaveBeenCalledWith(
			"account-id",
			{ name: "feature", json: true },
			expect.any(Object),
			expect.any(Object)
		);
	});

	describe("Workers Builds output", () => {
		runInTempDir();
		const std = mockConsoleMethods();

		beforeEach(() => {
			mocks.readBuildOutput.mockResolvedValue({
				rootConfig: {
					accountId: "account-id",
					buildContext: { isPreview: true },
				},
				workers: {
					default: {
						config: { type: "worker", name: "preview-worker" },
						bundleDir: "/project/bundle",
					},
					api: {
						config: { type: "worker", name: "api" },
						bundleDir: "/project/api",
					},
				},
			});
			mocks.assembleBuildResult.mockReturnValue({ content: "worker code" });
			mocks.getAuthToken.mockResolvedValue("token");
			mocks.createDeployContext.mockReturnValue({
				logger: { log: vi.fn(), info: vi.fn() },
			});
			mocks.previewBuildOutput.mockResolvedValue(previewResult);
		});

		it.each([
			{ quiet: false, worker: undefined, workerName: "preview-worker" },
			{ quiet: true, worker: undefined, workerName: "preview-worker" },
			{ quiet: true, worker: "api", workerName: "api" },
		])(
			"writes the selected Worker $workerName to an output directory with quiet=$quiet",
			async ({ quiet, worker, workerName }) => {
				const directory = resolve("build output with spaces", "nested");
				vi.stubEnv("WRANGLER_OUTPUT_FILE_DIRECTORY", directory);

				await expect(
					runCf([
						"previews",
						"deploy",
						"feature",
						"--prebuilt",
						...(quiet ? ["--quiet"] : []),
						...(worker ? ["--worker", worker] : []),
					])
				).resolves.toEqual({ exitCode: 0 });

				const files = readdirSync(directory);
				expect(files).toHaveLength(1);
				const filename = files[0];
				if (filename === undefined) {
					throw new Error("Expected a Preview output file.");
				}
				expect(filename).toMatch(/^wrangler-output-.*\.json$/);
				const entry = JSON.parse(
					readFileSync(resolve(directory, filename), "utf8")
				);
				expect(entry).toEqual({
					...createPreviewDeployOutput(previewResult),
					worker_name: workerName,
					timestamp: expect.any(String),
				});
				expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp);
				if (quiet) {
					expect(std.out).toBe("");
				} else {
					expect(JSON.parse(std.out)).toEqual(
						createPreviewDeployOutput(previewResult)
					);
				}
			}
		);

		it("appends to an explicit output file in preference to the directory", async () => {
			const file = resolve("explicit output", "entries.jsonl");
			const ignoredDirectory = resolve("ignored directory");
			mkdirSync(dirname(file), { recursive: true });
			writeFileSync(file, '{"existing":true}\n');
			vi.stubEnv("WRANGLER_OUTPUT_FILE_PATH", file);
			vi.stubEnv("WRANGLER_OUTPUT_FILE_DIRECTORY", ignoredDirectory);

			for (let i = 0; i < 2; i++) {
				await runPreviewDeploy({
					"preview-name": "feature",
					prebuilt: true,
				} as Parameters<typeof runPreviewDeploy>[0]);
			}

			const entries = readFileSync(file, "utf8")
				.trim()
				.split("\n")
				.map((line) => JSON.parse(line));
			expect(entries).toHaveLength(3);
			expect(entries[0]).toEqual({ existing: true });
			for (const entry of entries.slice(1)) {
				expect(entry).toEqual({
					...createPreviewDeployOutput(previewResult),
					worker_name: "preview-worker",
					timestamp: expect.any(String),
				});
			}
			expect(existsSync(ignoredDirectory)).toBe(false);
		});

		it("does not create an output file when neither output variable is set", async () => {
			const filesBefore = readdirSync(process.cwd());
			await runPreviewDeploy({
				"preview-name": "feature",
				prebuilt: true,
			} as Parameters<typeof runPreviewDeploy>[0]);
			expect(readdirSync(process.cwd())).toEqual(filesBefore);
		});

		it("does not record a failed Preview deployment", async () => {
			const directory = resolve("failed output");
			vi.stubEnv("WRANGLER_OUTPUT_FILE_DIRECTORY", directory);
			mocks.previewBuildOutput.mockRejectedValueOnce(
				new Error("Preview upload failed")
			);

			await expect(
				runPreviewDeploy({
					"preview-name": "feature",
					prebuilt: true,
				} as Parameters<typeof runPreviewDeploy>[0])
			).rejects.toThrow("Preview upload failed");
			expect(existsSync(directory)).toBe(false);
		});
	});

	it("returns the Preview deployment as JSON", () => {
		expect(createPreviewDeployOutput(previewResult)).toEqual({
			type: "preview",
			version: 1,
			preview_id: "preview-id",
			preview_name: "feature",
			preview_slug: "feature",
			preview_urls: ["https://feature.example.workers.dev"],
			deployment_id: "deployment-id",
			deployment_urls: ["https://deployment.example.workers.dev"],
		});
	});

	it.each([undefined, "HEAD"])(
		"rejects an unavailable branch before building",
		async (branch) => {
			mocks.getBranchName.mockReturnValue(branch);

			await expect(
				runPreviewDeploy({} as Parameters<typeof runPreviewDeploy>[0])
			).rejects.toThrow(
				"The name is optional when a branch is available. Otherwise, run:\n\n  cf previews deploy PREVIEW_NAME"
			);
			expect(mocks.runBuild).not.toHaveBeenCalled();
		}
	);
});
