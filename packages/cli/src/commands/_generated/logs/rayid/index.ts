import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rayid command group
 * @generated from apis/overlays/logs.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rayid",
	describe: "Operations for rayid",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
