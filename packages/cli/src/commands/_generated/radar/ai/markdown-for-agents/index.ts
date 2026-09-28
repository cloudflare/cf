import $summary from "./summary.js";
import $timeseries from "./timeseries.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * markdown-for-agents command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "markdown-for-agents",
	describe: "Operations for ai.markdown-for-agents",

	builder: (yargs) => {
		return yargs
			.command($summary)
			.command($timeseries)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
