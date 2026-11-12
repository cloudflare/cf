import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * crawlers command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "crawlers",
	describe: "Operations for bots.crawlers",

	builder: (yargs) => {
		return yargs
			.command($summary)
			.command($timeseriesgroups)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
