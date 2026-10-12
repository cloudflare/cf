import { readBuildOutput } from "@cloudflare/build-output-utils";
import {
	ApplicationsService,
	configureOpenAPIForContainerPull,
	initContainersSharedContext,
} from "@cloudflare/containers-shared";
import {
	assertPreviewBuildOutputRootConfig,
	getBranchName,
	initDeployHelpersContext,
	previewBuildOutput,
} from "@cloudflare/deploy-helpers";
import {
	getCloudflareApiBaseUrl,
	getCloudflareComplianceRegion,
} from "@cloudflare/workers-utils";
import { getAuthToken } from "../../lib/auth-token.js";
import { BuildOutputConfigError } from "../../lib/build-output-error.js";
import {
	buildOutputWorkerOption,
	parseWorkerConfig,
	selectBuildOutputWorker,
	validateBuildOutputMode,
} from "../../lib/build-output.js";
import { getAccountId } from "../../lib/context.js";
import { createDeployContext } from "../../lib/deploy-context.js";
import { assembleBuildResult } from "../../lib/deploy-input.js";
import { withCloudflareDotEnv } from "../../lib/dotenv.js";
import { formatOutput } from "../../lib/output.js";
import { runBuild } from "../build/index.js";
import {
	createContainerDeployConfig,
	isLiveContainerExport,
} from "../deploy/containers.js";
import { createPreviewContainerCallbacks } from "./containers.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { PreviewResult } from "@cloudflare/deploy-helpers";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.positional("preview-name", {
			type: "string",
			description:
				"Preview name. Defaults to the current CI or Git branch; required if no branch is available.",
		})
		.option("prebuilt", {
			type: "boolean",
			description:
				"Use existing Preview Build Output Specification files without building",
			default: false,
		})
		.option("worker", buildOutputWorkerOption);
}

type PreviewDeployArgs = InferArgs<typeof builder>;

export function createPreviewDeployOutput(result: PreviewResult) {
	return {
		type: "preview",
		version: 1,
		preview_id: result.preview.id,
		preview_name: result.preview.name,
		preview_slug: result.preview.slug,
		preview_urls: result.preview.urls,
		deployment_id: result.deployment.id,
		deployment_urls: result.deployment.urls,
	};
}

export async function runPreviewDeploy(
	argv: PreviewDeployArgs
): Promise<PreviewResult> {
	const explicitPreviewName = argv["preview-name"];
	const previewName = explicitPreviewName ?? getBranchName();
	// deploy-helpers checks Workers CI, GitHub, and GitLab before falling back to Git.
	// TODO(cloudflare/cf#329): Return undefined for detached checkouts without a CI branch.
	if (!previewName || (!explicitPreviewName && previewName === "HEAD")) {
		throw new Error(
			"We couldn't determine a Preview name from CI or Git. The name is optional when a branch is available. Otherwise, run:\n\n  cf previews deploy PREVIEW_NAME"
		);
	}

	if (!argv.prebuilt) {
		await runBuild(
			argv.mode,
			{ output: argv.quiet ? "silent" : "stderr", worker: argv.worker },
			{ isPreview: true }
		);
	}

	return withCloudflareDotEnv(argv, () =>
		deployPreviewBuildOutput(argv, previewName)
	);
}

async function deployPreviewBuildOutput(
	argv: PreviewDeployArgs,
	previewName: string
): Promise<PreviewResult> {
	const output = await readBuildOutput(process.cwd());
	assertPreviewBuildOutputRootConfig(output.rootConfig);
	validateBuildOutputMode(argv.mode, output.rootConfig.buildContext.mode);
	const worker = selectBuildOutputWorker(output.workers, argv.worker);
	const { wranglerConfig, builtConfig } = parseWorkerConfig(
		worker,
		output.rootConfig
	);

	const authToken = await getAuthToken();
	const accountId =
		output.rootConfig.accountId ??
		(await getAccountId({
			isPreview: true,
			skipProjectSettings: true,
			complianceRegion: getCloudflareComplianceRegion(wranglerConfig),
		}));
	const deployContext = createDeployContext(authToken);
	// TODO(cloudflare/cf#330): Let previewBuildOutput() return without printing.
	// Until then, hide its summary so this command prints one clean JSON result.
	initDeployHelpersContext({
		...deployContext,
		logger: {
			...deployContext.logger,
			log: () => {},
			info: () => {},
		},
	});
	initContainersSharedContext({
		logger: {
			...deployContext.logger,
			debug: () => {},
			debugWithSanitization: () => {},
			log: () => {},
			info: () => {},
		},
		fetchResult: deployContext.fetchResult,
		fetchPagedListResult: deployContext.fetchPagedListResult,
	});
	const liveContainerNames = new Set(
		Object.values(builtConfig.exports ?? {})
			.filter(isLiveContainerExport)
			.map(({ container }) => container)
	);
	const liveContainers =
		output.containers?.filter(({ config }) =>
			liveContainerNames.has(config.name)
		) ?? [];
	const containerDeployConfig = createContainerDeployConfig(
		liveContainers,
		wranglerConfig,
		{ accountId }
	);
	const previewContainers = containerDeployConfig.source;
	// Wrangler skips these apps during Preview normalization, which can report
	// success without preparing their named images. Reject before uploading.
	// https://github.com/cloudflare/workers-sdk/blob/b37c5df9b23fd2c06116d54bbeaf8da65014847c/packages/wrangler/src/containers/config.ts#L94-L100
	if (
		previewContainers?.some(
			(container) => container.scheduling_policy === "durable_object"
		)
	) {
		throw new BuildOutputConfigError(
			`Preview deployments do not support Durable Object-managed Containers (schedulingPolicy: "durable-object").`
		);
	}
	if (previewContainers && previewContainers.length > 0) {
		configureOpenAPIForContainerPull(
			accountId,
			authToken,
			getCloudflareApiBaseUrl(wranglerConfig)
		);
	}

	return previewBuildOutput(
		accountId,
		{ name: previewName, json: true },
		{
			workerConfig: builtConfig,
			rootConfig: output.rootConfig,
			containers: liveContainers
				.filter(({ config }) =>
					previewContainers?.some(({ name }) => name === config.name)
				)
				.map(({ config }) => config),
			buildResult: worker.bundleDir
				? assembleBuildResult(worker, builtConfig)
				: undefined,
			assets: worker.assetsDir ? { directory: worker.assetsDir } : undefined,
		},
		{
			...createPreviewContainerCallbacks(containerDeployConfig),
			verifyContainersScope: async () => {
				await ApplicationsService.listApplications();
			},
		}
	);
}

const command: CommandModule<CommonYargsOptions, PreviewDeployArgs> = {
	command: "deploy [preview-name]",
	describe: "Deploy a Worker Preview",
	builder,
	handler: async (argv) => {
		if (argv.local) {
			throw new Error("--local is not supported by cf previews deploy.");
		}
		const result = await runPreviewDeploy(argv);
		formatOutput(createPreviewDeployOutput(result), { quiet: argv.quiet });
	},
};

export default command;
