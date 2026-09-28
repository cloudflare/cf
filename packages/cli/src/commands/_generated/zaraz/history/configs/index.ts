import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * configs command group
 * @generated from apis/overlays/zaraz.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "configs",
	describe: "Operations for history.configs",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
