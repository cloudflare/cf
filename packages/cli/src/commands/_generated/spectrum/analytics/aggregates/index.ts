import $currents from "./currents/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * aggregates command group
 * @generated from apis/overlays/spectrum.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "aggregates",
	describe: "Operations for analytics.aggregates",

	builder: (yargs) => {
		return yargs
			.command($currents)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
