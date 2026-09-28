import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * report command group
 * @generated from apis/overlays/spectrum.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "report",
	describe: "Operations for analytics.zones.report",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
