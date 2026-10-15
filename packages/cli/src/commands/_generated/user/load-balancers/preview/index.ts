import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * preview command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "preview",
	describe: "Retrieve the results of a monitor or pool health preview",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
