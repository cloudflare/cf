import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * summaries command group
 * @generated from apis/overlays/spectrum.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "summaries",
	describe: "Operations for analytics.events.summaries",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
