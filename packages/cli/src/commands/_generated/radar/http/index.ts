import $ases from "./ases/index.js";
import $locations from "./locations/index.js";
import $summaryv2 from "./summary-v2.js";
import $timeseriesgroupsv2 from "./timeseries-groups-v2.js";
import $timeseries from "./timeseries.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * http command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "http",
	describe:
		"HTTP protocol trends — TLS versions, HTTP versions, browser share, and OS distribution",

	builder: (yargs) => {
		return yargs
			.command($summaryv2)
			.command($timeseries)
			.command($timeseriesgroupsv2)
			.command($ases)
			.command($locations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
