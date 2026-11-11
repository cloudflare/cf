import $get from "./get.js";
import $list from "./list.js";
import $locations from "./locations/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * traffic-anomalies command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "traffic-anomalies",
	describe:
		"Detected traffic anomalies and unusual patterns in Internet traffic flows",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.command($locations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
