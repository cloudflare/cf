import $summaryv2 from "./summary-v2.js";
import $timeseriesgroupsv2 from "./timeseries-groups-v2.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * leaked-credentials command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "leaked-credentials",
	describe: "Leaked credential detection trends and exposure statistics",

	builder: (yargs) => {
		return yargs
			.command($summaryv2)
			.command($timeseriesgroupsv2)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
