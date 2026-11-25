import {
	initDeployHelpersContext,
	triggersDeploy,
} from "@cloudflare/deploy-helpers";
import { resolveBuildOutputAuth } from "../../../lib/build-output-auth.js";
import { withBuildOutputDotEnv } from "../../../lib/build-output-dotenv.js";
import {
	applyCIWorkerNameOverride,
	buildOutputWorkerOption,
	parseWorkerConfig,
	resolveBuildOutputSettings,
	selectBuildOutputWorker,
	validateBuildOutputMode,
} from "../../../lib/build-output.js";
import { createDeployContext } from "../../../lib/deploy-context.js";
import { createTriggerProps } from "../../../lib/deploy-input.js";
import { log } from "../../../lib/ui/log.js";
import { runBuild } from "../../build/index.js";
import type { CommonYargsOptions, InferArgs } from "../../../lib/cli-types.js";
import type { BuildOutput } from "@cloudflare/build-output-utils";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.hide("local")
		.hide("persist-to")
		.epilogue("Local simulation (--local) is not supported by this command.")
		.option("prebuilt", {
			type: "boolean",
			description:
				"Use existing Build Output Specification files without building",
			default: false,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Run checks without applying triggers",
			default: false,
		})
		.option("worker", buildOutputWorkerOption);
}

type TriggersDeployArgs = InferArgs<typeof builder>;

const triggersDeployCommand: CommandModule<
	CommonYargsOptions,
	TriggersDeployArgs
> = {
	command: "deploy",
	describe: "Apply triggers (Routes, Workflows, Cron triggers etc.)",
	builder,
	handler: async (argv) => {
		if (argv.local) {
			throw new Error(
				"--local is not supported by cf workers triggers deploy."
			);
		}

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

		await withBuildOutputDotEnv((output) => deployTriggers(argv, output));
	},
};

async function deployTriggers(
	argv: TriggersDeployArgs,
	{ workers, rootConfig }: BuildOutput
): Promise<void> {
	if (rootConfig.buildContext.isPreview) {
		const previewCommand = [
			"cf previews deploy",
			"--prebuilt",
			...(rootConfig.buildContext.mode === undefined
				? []
				: ["--mode", rootConfig.buildContext.mode]),
		].join(" ");
		throw new Error(
			`The Build Output was created for a Preview, but this command deploys production triggers. To use the existing Build Output and deploy the Preview, run "${previewCommand}". To deploy production triggers, rebuild without Preview settings before deploying.`
		);
	}
	validateBuildOutputMode(argv.mode, rootConfig.buildContext.mode);
	const { complianceRegion } = resolveBuildOutputSettings(
		rootConfig.settings,
		argv["temporary-account"] === true
	);
	const { worker } = applyCIWorkerNameOverride(
		selectBuildOutputWorker(workers, argv.worker)
	);
	const { wranglerConfig } = parseWorkerConfig(worker, rootConfig);

	const { authToken, accountId } = await resolveBuildOutputAuth({
		accountId: rootConfig.settings?.accountId,
		complianceRegion,
		dryRun: argv["dry-run"],
	});

	initDeployHelpersContext(createDeployContext(authToken));

	log.section("Deploy triggers");
	await triggersDeploy({
		...createTriggerProps(worker, wranglerConfig, accountId, argv),
		queueCreateCommand: (queueName) =>
			`cf queues create --queue-name ${queueName}`,
		workersDevConfigFieldName: "workersDev",
		workersDevConfigAssignment: (value) => `workersDev: ${value}`,
		previewUrlsConfigFieldName: "previewUrls",
		previewUrlsConfigAssignment: (value) => `previewUrls: ${value}`,
	});
	if (!argv["dry-run"]) {
		log.success("Trigger deploy complete");
	}
}

export default triggersDeployCommand;
