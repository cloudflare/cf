import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * list command group
 * @generated from apis/overlays/logs.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "list",
	describe: "Operations for list",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
