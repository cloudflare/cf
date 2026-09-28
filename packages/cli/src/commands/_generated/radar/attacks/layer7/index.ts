import $summaryv2 from "./summary-v2.js";
import $timeseriesgroupsv2 from "./timeseries-groups-v2.js";
import $timeseries from "./timeseries.js";
import $top from "./top/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * layer7 command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "layer7",
	describe: "Operations for attacks.layer7",

	builder: (yargs) => {
		return yargs
			.command($summaryv2)
			.command($timeseries)
			.command($timeseriesgroupsv2)
			.command($top)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
