import { writeFile } from "node:fs/promises";
import path from "node:path";
import { runBuild } from "#commands/build/index.js";
import {
	BuildOutputConfigError,
	buildOutputWorkerOption,
	parseWorkerConfig,
	selectBuildOutputWorker,
	validateBuildOutputMode,
} from "#lib/build-output.js";
import { assembleBuildResult } from "#lib/deploy-input.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { readBuildOutput } from "@cloudflare/build-output-utils";
import { createWorkerUploadForm } from "@cloudflare/deploy-helpers/create-worker-upload-form";
import {
	analyseBundle,
	getBundleSize,
	summarizeStartupProfile,
} from "@cloudflare/deploy-helpers/startup-profile";
import { getBindings } from "@cloudflare/workers-utils";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

const DEFAULT_OUTFILE = "worker-startup.cpuprofile";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.option("outfile", {
			type: "string",
			description: "Output file for the startup CPU profile",
			default: DEFAULT_OUTFILE,
			requiresArg: true,
		})
		.option("prebuilt", {
			type: "boolean",
			description:
				"Use existing Build Output Specification files without building",
			default: false,
		})
		.option("worker", buildOutputWorkerOption);
}

type CheckArgs = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, CheckArgs> = {
	command: "check",
	describe: "Profile a Worker's startup performance",
	builder,
	handler: async (argv) => {
		if (argv.local) {
			throw new Error("--local is not supported by cf workers check.");
		}

		if (!argv.prebuilt) {
			await runBuild(argv.mode, {
				output: argv.quiet ? "silent" : "stderr",
				worker: argv.worker,
			});
		}

		const { workers, rootConfig } = await readBuildOutput(process.cwd());
		validateBuildOutputMode(argv.mode, rootConfig.buildContext.mode, {
			requireRequestedMode: argv.prebuilt,
		});
		const worker = selectBuildOutputWorker(workers, argv.worker);
		const { wranglerConfig, builtConfig } = parseWorkerConfig(
			worker,
			rootConfig
		);
		const buildResult = assembleBuildResult(worker, builtConfig);

		if (!buildResult.resolvedEntryPointPath) {
			throw new BuildOutputConfigError(
				"Startup profiling requires a Worker entrypoint; assets-only projects cannot be profiled."
			);
		}

		if (buildResult.bundleType === "commonjs") {
			throw new BuildOutputConfigError(
				"Startup profiling does not support service-worker format Workers. Refer to https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/ for migration guidance."
			);
		}

		const workerBundle = createWorkerUploadForm(
			{
				name: wranglerConfig.name ?? worker.config.name ?? "worker",
				main: {
					name:
						builtConfig.manifest?.mainModule ??
						path.basename(buildResult.resolvedEntryPointPath),
					filePath: buildResult.resolvedEntryPointPath,
					content: buildResult.content,
					type: buildResult.bundleType,
				},
				modules: buildResult.modules,
				sourceMaps: buildResult.sourceMaps,
				compatibility_date: wranglerConfig.compatibility_date,
				compatibility_flags: wranglerConfig.compatibility_flags ?? [],
				assets: undefined,
				containers: undefined,
				migrations: undefined,
				exports: undefined,
				keepVars: undefined,
				keepSecrets: undefined,
				logpush: undefined,
				placement: undefined,
				tail_consumers: undefined,
				streaming_tail_consumers: undefined,
				limits: undefined,
				annotations: undefined,
				observability: undefined,
				cache: undefined,
				package_dependencies: undefined,
			},
			getBindings(wranglerConfig),
			{
				dryRun: true,
				unsafe: wranglerConfig.unsafe,
			}
		);

		const bundleSize = await getBundleSize(workerBundle);
		const profile = argv.quiet
			? await analyseBundle(workerBundle)
			: await withProgress("Profiling Worker startup", () =>
					analyseBundle(workerBundle)
				);
		const summary = summarizeStartupProfile(profile);
		await writeFile(argv.outfile, JSON.stringify(profile));

		formatOutput(
			{
				bundle: {
					sizeBytes: bundleSize.size,
					gzipSizeBytes: bundleSize.gzipSize,
				},
				startup: {
					profileWindowMs: summary.profileWindow / 1000,
					sampledTimeMs: summary.sampledTime / 1000,
					activeTimeMs: summary.activeTime / 1000,
					garbageCollectionTimeMs: summary.garbageCollectionTime / 1000,
					idleTimeMs: summary.idleTime / 1000,
					sampleCount: summary.sampleCount,
				},
				profile: argv.outfile,
				note: "This profile was measured locally. Use it to understand where startup time is spent, not to predict startup time on Cloudflare.",
			},
			{ quiet: argv.quiet }
		);
	},
};

export default command;
