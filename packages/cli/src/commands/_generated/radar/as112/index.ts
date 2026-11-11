import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $timeseries from "./timeseries.js";
import $top from "./top/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * as112 command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "as112",
	describe:
		"AS112 DNS sinkhole statistics — reverse DNS query volumes for private address space",

	builder: (yargs) => {
		return yargs
			.command($summary)
			.command($timeseries)
			.command($timeseriesgroups)
			.command($top)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
