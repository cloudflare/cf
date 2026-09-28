import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dcv-delegation command
 * @generated from apis/overlays/dcv-delegation.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dcv-delegation",
	describe: "dcv-delegation",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
