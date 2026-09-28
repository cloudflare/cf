import $resources from "./resources/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tags command
 * @generated from apis/overlays/tags.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tags",
	describe: "tags",

	builder: (yargs) => {
		return yargs
			.command($resources)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
