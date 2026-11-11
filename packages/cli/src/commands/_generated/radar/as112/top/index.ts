import $locations from "./locations/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * top command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "top",
	describe: "Operations for as112.top",

	builder: (yargs) => {
		return yargs
			.command($locations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
