import $get from "./get.js";
import $list from "./list.js";
import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $timeseries from "./timeseries.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * origins command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "origins",
	describe:
		"Cloud and hosting origin providers (e.g. Amazon, by region) and their traffic metrics",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.command($summary)
			.command($timeseries)
			.command($timeseriesgroups)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
