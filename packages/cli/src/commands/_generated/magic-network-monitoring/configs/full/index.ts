import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * full command group
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "full",
	describe: "Operations for configs.full",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
