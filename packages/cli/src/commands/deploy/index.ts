import { runUpload, sharedUploadBuilder } from "./shared.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return sharedUploadBuilder(yargs)
		.option("provision", {
			type: "boolean",
			description:
				"Automatically provision resources for bindings that need them",
			default: true,
		})
		.option("dispatch-namespace", {
			type: "string",
			description:
				"Name of a dispatch namespace to deploy the Worker to (Workers for Platforms)",
			requiresArg: true,
		})
		.option("containers-rollout", {
			description:
				"Rollout strategy for Container changes. Immediate rolls out to all instances in one step; none leaves deployed Containers unchanged.",
			choices: ["immediate", "gradual", "none"] as const,
		});
}

export type DeployArgs = InferArgs<typeof builder>;

const deployCommand: CommandModule<CommonYargsOptions, DeployArgs> = {
	command: "deploy",
	describe: "Deploy a worker to Cloudflare",
	builder,
	handler: async (argv) => {
		await runUpload(argv, { command: "Deploy" });
	},
};

export default deployCommand;
