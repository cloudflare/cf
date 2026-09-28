import * as clack from "@clack/prompts";
import { readBuildOutput } from "@cloudflare/build-output-utils";
import {
	initDeployHelpersContext,
	triggersDeploy,
} from "@cloudflare/deploy-helpers";
import { getAccountId, getAuthToken } from "../../../lib/auth.js";
import {
	buildOutputWorkerOption,
	parseWorkerConfig,
	selectBuildOutputWorker,
	validateBuildOutputMode,
} from "../../../lib/build-output.js";
import { createDeployContext } from "../../../lib/deploy-context.js";
import { createTriggerProps } from "../../../lib/deploy-input.js";
import { withCloudflareDotEnv } from "../../../lib/dotenv.js";
import { theme } from "../../../lib/ui/index.js";
import { runBuild } from "../../build/index.js";
import type { CommonYargsOptions, InferArgs } from "../../../lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
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
		if (!argv.prebuilt) {
			await runBuild(argv.mode, { worker: argv.worker });
			clack.log.message("", { spacing: 0 });
		}

		await withCloudflareDotEnv(argv, () => deployTriggers(argv));
	},
};

async function deployTriggers(argv: TriggersDeployArgs): Promise<void> {
	const { workers, rootConfig } = await readBuildOutput(process.cwd());
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
	validateBuildOutputMode(argv.mode, rootConfig.buildContext.mode, {
		requireRequestedMode: argv.prebuilt,
	});
	const worker = selectBuildOutputWorker(workers, argv.worker);
	const { wranglerConfig } = parseWorkerConfig(worker, rootConfig);

	// Dry runs make no API requests, so they never need credentials.
	const authToken = argv["dry-run"] ? "" : await getAuthToken();
	const accountId = argv["dry-run"] ? undefined : await getAccountId();
	initDeployHelpersContext(createDeployContext(authToken));

	clack.log.message(theme.bold("Deploy triggers"), {
		symbol: theme.muted("\u251C"),
		spacing: 0,
	});
	await triggersDeploy(
		createTriggerProps(worker, wranglerConfig, accountId, argv)
	);
	clack.log.success(
		argv["dry-run"] ? "Dry run complete" : "Trigger deploy complete"
	);
}

export default triggersDeployCommand;
