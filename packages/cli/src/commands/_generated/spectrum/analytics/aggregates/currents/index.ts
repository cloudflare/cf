import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * currents command group
 * @generated from apis/overlays/spectrum.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "currents",
	describe: "Operations for analytics.aggregates.currents",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
