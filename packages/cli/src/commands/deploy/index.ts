import { log } from "../../lib/ui/log.js";
import { runUpload, sharedUploadBuilder } from "./shared.js";
import {
	prepareStaticAssetsBuildOutput,
	staticAssetsDirectoryOption,
} from "./static-assets.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return sharedUploadBuilder(yargs)
		.positional("directory", staticAssetsDirectoryOption)
		.option("provision", {
			type: "boolean",
			description:
				"Automatically provision resources for bindings that need them",
			default: true,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description:
				"Allow upload in CI despite conflicting remote Worker changes",
			default: false,
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
	command: "deploy [directory]",
	describe:
		"Deploy a Worker, static site, or full-stack application to Cloudflare",
	builder,
	handler: async (argv) => {
		if (argv.force && !argv["dry-run"]) {
			log.warn(
				"Using --force may overwrite conflicting remote Worker changes."
			);
		}
		const preparedStaticAssets = await prepareStaticAssetsBuildOutput(argv, {
			isPreview: false,
		});
		await runUpload(preparedStaticAssets ? { ...argv, prebuilt: true } : argv, {
			command: "Deploy",
		});
	},
};

export default deployCommand;
