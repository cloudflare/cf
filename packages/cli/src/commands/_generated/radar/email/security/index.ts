import $summaryv2 from "./summary-v2.js";
import $timeseriesgroupsv2 from "./timeseries-groups-v2.js";
import $top from "./top/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * security command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "security",
	describe: "Operations for email.security",

	builder: (yargs) => {
		return yargs
			.command($summaryv2)
			.command($timeseriesgroupsv2)
			.command($top)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
