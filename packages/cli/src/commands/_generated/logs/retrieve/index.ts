import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * retrieve command group
 * @generated from apis/overlays/logs.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "retrieve",
	describe: "Operations for retrieve",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
