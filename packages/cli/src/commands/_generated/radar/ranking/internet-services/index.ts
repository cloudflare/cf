import $categories from "./categories.js";
import $timeseriesgroups from "./timeseries-groups.js";
import $top from "./top.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * internet-services command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "internet-services",
	describe: "Operations for ranking.internet-services",

	builder: (yargs) => {
		return yargs
			.command($categories)
			.command($timeseriesgroups)
			.command($top)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
