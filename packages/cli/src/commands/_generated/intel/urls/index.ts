import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * urls command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "urls",
	describe: "Operations for urls",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
