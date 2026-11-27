import {
	configureOpenAPIForContainerPull,
	initContainersSharedContext,
} from "@cloudflare/containers-shared";
import {
	deploy,
	versionsUpload,
	initDeployHelpersContext,
} from "@cloudflare/deploy-helpers";
import { getCloudflareApiBaseUrl } from "@cloudflare/workers-utils";
import { resolveBuildOutputAuth } from "../../lib/build-output-auth.js";
import { withBuildOutputDotEnv } from "../../lib/build-output-dotenv.js";
import {
	applyCIMatchWorkerTag,
	applyCIWorkerNameOverride,
	buildOutputWorkerOption,
	parseWorkerConfig,
	resolveBuildOutputSettings,
	selectBuildOutputWorker,
	validateBuildOutputMode,
} from "../../lib/build-output.js";
import { CliExit } from "../../lib/cli-exit.js";
import { applyDependenciesInstrumentationEnv } from "../../lib/dependencies-instrumentation.js";
import { createDeployContext } from "../../lib/deploy-context.js";
import {
	assembleBuildResult,
	createDeployProps,
	createVersionsUploadProps,
} from "../../lib/deploy-input.js";
import { confirm } from "../../lib/dialog.js";
import { isNonInteractiveOrCI } from "../../lib/interactive.js";
import { log } from "../../lib/ui/log.js";
import { runBuild } from "../build/index.js";
import { createContainerDeployConfig } from "./containers.js";
import { secretsFileDescription } from "./secrets-file-description.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { BuildOutput } from "@cloudflare/build-output-utils";
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
			description: secretsFileDescription,
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
	force?: boolean;
	"dispatch-namespace"?: string;
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
	if (
		ctx.command === "Deploy" &&
		argv["dry-run"] &&
		!argv["dispatch-namespace"]
	) {
		log.info(
			"Dry run: no traffic changes. A real deploy would replace any active traffic split with a 100% rollout to the new version."
		);
	}
	// Delegate the build before applying cf's dotenv values.
	if (!argv.prebuilt) {
		const build = await runBuild(argv.mode, {
			worker: argv.worker,
			dryRun: argv["dry-run"],
		});
		if (build === "setup-needed") {
			log.success("--dry-run: exiting now.");
			return;
		}
		log.message("");
	}

	return withBuildOutputDotEnv((output) =>
		uploadBuildOutput(argv, ctx, output)
	);
}

async function uploadBuildOutput(
	argv: UploadArgs,
	ctx: UploadCommand,
	{ root, workers, rootConfig, containers }: BuildOutput
) {
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
	const { complianceRegion } = resolveBuildOutputSettings(
		rootConfig.settings,
		argv["temporary-account"] === true
	);
	const { worker, workerNameOverridden } = applyCIWorkerNameOverride(
		selectBuildOutputWorker(workers, argv.worker)
	);
	const parsedWorker = parseWorkerConfig(worker, rootConfig);
	const wranglerConfig = applyDependenciesInstrumentationEnv(
		parsedWorker.wranglerConfig
	);
	const buildResult = assembleBuildResult(
		worker,
		parsedWorker.builtConfig,
		root,
		{ includeSourceMaps: !argv["temporary-account"] }
	);

	const { authToken, accountId } = await resolveBuildOutputAuth({
		accountId: rootConfig.settings?.accountId,
		complianceRegion,
		dryRun: argv["dry-run"],
	});

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
	let uploadAborted = false;
	const previousExitCode = process.exitCode;
	const restoreCIMatchTag = applyCIMatchWorkerTag();
	try {
		// deploy-helpers signals strict aborts through exitCode; isolate this call.
		process.exitCode = undefined;
		if (ctx.command === "Deploy") {
			const props = createDeployProps(
				worker,
				wranglerConfig,
				accountId,
				argv,
				containerDeployConfig
			);
			props.workerNameOverridden = workerNameOverridden;

			log.section("Deploy");
			const result = await deploy(props, wranglerConfig, buildResult, {
				deployCommand: "cf deploy",
				confirmTrafficSplitReplacement: async (versions) => {
					const split = versions
						.map(
							({ version_id, percentage }) => `${version_id} (${percentage}%)`
						)
						.join(", ");
					const message = `Deploying will replace the active traffic split (${split}) and send 100% of traffic to the new version.`;
					if (argv.force) {
						log.warn(message);
						return true;
					}
					if (isNonInteractiveOrCI()) {
						log.warn(
							`${message} A non-interactive deploy requires explicit approval.`,
							"cf deploy --force"
						);
						return false;
					}
					return confirm(`${message} Continue?`, { defaultValue: false });
				},
				versionsDeployCommand:
					"cf workers deployments create --worker <worker-name> --strategy percentage --versions <versions-json>",
				d1ListCommand: "cf d1 list",
				d1DeleteCommand: "cf d1 delete <database-id>",
				queueCreateCommand: (queueName) =>
					`cf queues create --queue-name ${queueName}`,
				secretPutCommand:
					"cf workers secrets update --worker <worker-name> --type secret_text",
				workersDevConfigFieldName: "workersDev",
				workersDevConfigAssignment: (value) => `workersDev: ${value}`,
				previewUrlsConfigFieldName: "previewUrls",
				previewUrlsConfigAssignment: (value) => `previewUrls: ${value}`,
				configFileName: "cloudflare.config.ts",
				observabilityTargetPercentageField: "targetInstancePercentage",
				observabilityTargetCountField: "targetInstanceCount",
				syncWorkersSite: undefined,
				analyseBundle: undefined,
			});
			if (result.trafficSplitReplacementDeclined) {
				log.warn("Deploy cancelled. The active traffic split is unchanged.");
				throw new CliExit(1);
			}
			versionId = result.versionId;
		} else {
			const props = createVersionsUploadProps(
				worker,
				wranglerConfig,
				accountId,
				argv,
				containerDeployConfig
			);
			props.workerNameOverridden = workerNameOverridden;

			log.section("Upload");
			({ versionId } = await versionsUpload(
				props,
				wranglerConfig,
				buildResult,
				{
					deployCommand: "cf deploy",
					versionsUploadCommand: "cf workers versions create",
					versionsDeployCommand:
						"cf workers deployments create --worker <worker-name> --strategy percentage --versions <versions-json>",
					triggersDeployCommand: "cf workers triggers deploy",
					d1ListCommand: "cf d1 list",
					d1DeleteCommand: "cf d1 delete <database-id>",
					queueCreateCommand: (queueName) =>
						`cf queues create --queue-name ${queueName}`,
					versionsSecretPutCommand: "wrangler versions secret put",
					analyseBundle: undefined,
				}
			));
		}
		uploadAborted =
			versionId === null && process.exitCode === 1 && !argv["dry-run"];
	} finally {
		process.exitCode ??= previousExitCode;
		restoreCIMatchTag();
	}
	if (uploadAborted) {
		throw new CliExit(1);
	}

	if (!argv["dry-run"]) {
		log.success(`${ctx.command} complete`);
	}
}
