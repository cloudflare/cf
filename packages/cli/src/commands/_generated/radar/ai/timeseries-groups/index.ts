import $summary from "./summary.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * timeseries-groups command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "timeseries-groups",
	describe: "Operations for ai.timeseries-groups",

	builder: (yargs) => {
		return yargs
			.command($summary)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
