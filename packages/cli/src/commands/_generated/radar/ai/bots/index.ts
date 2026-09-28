import $timeseriesgroups from "./timeseries-groups.js";
import $timeseries from "./timeseries.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * bots command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "bots",
	describe: "Operations for ai.bots",

	builder: (yargs) => {
		return yargs
			.command($timeseries)
			.command($timeseriesgroups)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
