import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * uploads command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "uploads",
	describe: "Operations for indicator-feeds.uploads",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
