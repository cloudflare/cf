import $summary from "./summary.js";
import $timeseries from "./timeseries.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * findings command group
 * @generated from apis/overlays/analytics.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "findings",
	describe: "Operations for query.data-security.findings",

	builder: (yargs) => {
		return yargs
			.command($summary)
			.command($timeseries)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
