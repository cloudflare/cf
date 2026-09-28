import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tcp-resets-timeouts command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tcp-resets-timeouts",
	describe:
		"TCP connection reset and timeout statistics indicating network health issues",

	builder: (yargs) => {
		return yargs
			.command($summary)
			.command($timeseriesgroups)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
