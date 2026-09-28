import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * download command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "download",
	describe: "Operations for pcaps.download",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
