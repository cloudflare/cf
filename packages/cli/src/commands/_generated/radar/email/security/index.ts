import $summary from "./summary.js";
import $timeseriesgroups from "./timeseries-groups.js";
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
			.command($summary)
			.command($timeseriesgroups)
			.command($top)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
