import $authorities from "./authorities/index.js";
import $logs from "./logs/index.js";
import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $timeseries from "./timeseries.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ct command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ct",
	describe:
		"Certificate Transparency log monitoring and newly-issued certificate discovery",

	builder: (yargs) => {
		return yargs
			.command($summary)
			.command($timeseries)
			.command($timeseriesgroups)
			.command($authorities)
			.command($logs)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
