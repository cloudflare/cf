import $settings from "./settings/index.js";
import $tokens from "./tokens/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * network-quality command
 * @generated from apis/overlays/network-quality.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "network-quality",
	describe: "network-quality",

	builder: (yargs) => {
		return yargs
			.command($settings)
			.command($tokens)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
