import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * bytimes command group
 * @generated from apis/overlays/spectrum.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "bytimes",
	describe: "Operations for analytics.events.bytimes",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
