import $list from "./list.js";
import $locations from "./locations.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * outages command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "outages",
	describe: "Operations for annotations.outages",

	builder: (yargs) => {
		return yargs
			.command($list)
			.command($locations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
