import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
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
			.command($summary)
			.command($timeseriesgroups)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
