import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $timeseries from "./timeseries.js";
import $top from "./top/index.js";
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
			.command($summary)
			.command($timeseries)
			.command($timeseriesgroups)
			.command($top)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
