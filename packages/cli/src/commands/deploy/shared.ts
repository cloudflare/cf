import * as clack from "@clack/prompts";
import { readBuildOutput } from "@cloudflare/build-output-utils";
import {
	cleanupBuiltImages,
	configureOpenAPIForContainerPull,
	initContainersSharedContext,
} from "@cloudflare/containers-shared";
import {
	deploy,
	versionsUpload,
	initDeployHelpersContext,
} from "@cloudflare/deploy-helpers";
import {
	getCloudflareApiBaseUrl,
	getCloudflareComplianceRegion,
	getDockerPath,
} from "@cloudflare/workers-utils";
import { getAuthToken } from "../../lib/auth-token.js";
import {
	buildOutputWorkerOption,
	parseWorkerConfig,
	selectBuildOutputWorker,
	validateBuildOutputMode,
} from "../../lib/build-output.js";
import { getAccountId } from "../../lib/context.js";
import { createDeployContext } from "../../lib/deploy-context.js";
import {
	assembleBuildResult,
	createDeployProps,
	createVersionsUploadProps,
} from "../../lib/deploy-input.js";
import { withCloudflareDotEnv } from "../../lib/dotenv.js";
import { theme } from "../../lib/ui/index.js";
import { runBuild } from "../build/index.js";
import { createContainerDeployConfig } from "./containers.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { Argv } from "yargs";

/**
 * Yargs options shared between `cf deploy` and `cf workers versions create`.
 * Both commands build, parse build output, resolve auth, and upload
 * a Worker version — the difference is what happens after the upload
 * (deploy triggers a deployment; versions create does not).
 */
export function sharedUploadBuilder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.option("prebuilt", {
			type: "boolean",
			description:
				"Deploy existing Build Output Specification files without building",
			default: false,
		})
		.option("tag", {
			type: "string",
			description: "A tag to associate with this Worker Version",
			requiresArg: true,
		})
		.option("message", {
			type: "string",
			description: "A message to associate with this Worker Version",
			requiresArg: true,
		})
		.option("secrets-file", {
			type: "string",
			description:
				"Path to a file containing secrets to upload with the version (JSON or .env format)",
			requiresArg: true,
		})
		.option("dry-run", {
			describe:
				"Build a project and run checks without actually uploading the Worker",
			type: "boolean",
			default: false,
		})
		.option("worker", buildOutputWorkerOption);
}

export type SharedUploadArgs = InferArgs<typeof sharedUploadBuilder>;

type UploadCommand = { command: "Deploy" } | { command: "Version upload" };
type UploadArgs = SharedUploadArgs & {
	provision?: boolean;
	"preview-alias"?: string;
	"containers-rollout"?: "immediate" | "gradual" | "none";
};

/**
 * Shared handler for `cf deploy` and `cf workers versions create`.
 *
 * Both commands follow the same sequence: build, parse output, resolve
 * auth, init deploy-helpers, create props, call deploy-helpers, print
 * result. The only branching is which deploy-helpers function is called
 * and which props are constructed.
 */
export async function runUpload(argv: UploadArgs, ctx: UploadCommand) {
	// Delegate the build before applying cf's dotenv values.
	if (!argv.prebuilt) {
		const build = await runBuild(argv.mode, {
			worker: argv.worker,
			dryRun: argv["dry-run"],
		});
		if (build === "setup-needed") {
			clack.log.success("--dry-run: exiting now.");
			return;
		}
		clack.log.message("", { spacing: 0 });
	}

	return withCloudflareDotEnv(argv, () => uploadBuildOutput(argv, ctx));
}

async function uploadBuildOutput(argv: UploadArgs, ctx: UploadCommand) {
	// Parse the build output with cf's dotenv values available.
	const { workers, rootConfig, containers } = await readBuildOutput(
		process.cwd()
	);
	// --prebuilt can reuse files left behind by a Preview build.
	// Stop here so a production deploy cannot publish that Preview configuration.
	if (rootConfig.buildContext.isPreview) {
		const previewCommand = [
			"cf previews deploy",
			...(argv.prebuilt ? ["--prebuilt"] : []),
			...(rootConfig.buildContext.mode === undefined
				? []
				: ["--mode", rootConfig.buildContext.mode]),
		].join(" ");
		throw new Error(
			`This build output is for a Preview. Run ${previewCommand} instead.`
		);
	}
	validateBuildOutputMode(argv.mode, rootConfig.buildContext.mode);
	const worker = selectBuildOutputWorker(workers, argv.worker);
	const { wranglerConfig, builtConfig } = parseWorkerConfig(worker, rootConfig);
	const buildResult = assembleBuildResult(worker, builtConfig);

	// Resolve auth + account. Dry runs make no API requests: deploy-helpers
	// skips its account-scoped checks (such as the latest-deployment lookup)
	// only when no account is supplied, so leave it unresolved.
	const authToken = argv["dry-run"] ? "" : await getAuthToken();
	const accountId = argv["dry-run"]
		? undefined
		: (rootConfig.accountId ??
			(await getAccountId({
				skipProjectSettings: true,
				complianceRegion: getCloudflareComplianceRegion(wranglerConfig),
			})));

	// Initialize the deploy-helpers context.
	const deployContext = createDeployContext(authToken);
	initDeployHelpersContext(deployContext);
	initContainersSharedContext({
		logger: deployContext.logger,
		fetchResult: deployContext.fetchResult,
		fetchPagedListResult: deployContext.fetchPagedListResult,
	});
	if (accountId !== undefined && containers.length > 0) {
		configureOpenAPIForContainerPull(
			accountId,
			authToken,
			getCloudflareApiBaseUrl(wranglerConfig)
		);
	}
	const containerDeployConfig = createContainerDeployConfig(
		containers,
		wranglerConfig,
		{
			accountId,
			containersRollout: argv["containers-rollout"],
		}
	);

	// Upload.
	let versionId: string | null;
	if (ctx.command === "Deploy") {
		const props = createDeployProps(
			worker,
			wranglerConfig,
			accountId,
			argv,
			containerDeployConfig
		);

		clack.log.message(theme.bold("Deploy"), {
			symbol: theme.muted("\u251C"),
			spacing: 0,
		});
		({ versionId } = await deploy(props, wranglerConfig, buildResult, {
			syncWorkersSite: undefined,
			analyseBundle: undefined,
		}));
	} else {
		const props = createVersionsUploadProps(
			worker,
			wranglerConfig,
			accountId,
			argv,
			containerDeployConfig
		);

		clack.log.message(theme.bold("Upload"), {
			symbol: theme.muted("\u251C"),
			spacing: 0,
		});
		({ versionId } = await versionsUpload(props, wranglerConfig, buildResult, {
			analyseBundle: undefined,
		}));
	}

	if (
		versionId !== null &&
		!argv["dry-run"] &&
		(ctx.command !== "Deploy" || argv["containers-rollout"] !== "none")
	) {
		await cleanupBuiltImages(
			[
				...(ctx.command === "Deploy"
					? containerDeployConfig.standard.builtImages
					: []),
				...containerDeployConfig.durableObjects.builtImages,
			],
			getDockerPath()
		);
	}

	if (!argv["dry-run"]) {
		clack.log.success(`${ctx.command} complete`);
	}
}
