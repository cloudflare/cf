import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * live command
 * @generated from apis/overlays/live.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "live",
	describe: "live",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
