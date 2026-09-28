import $datasecurity from "./data-security/index.js";
import $summary from "./summary.js";
import $timeseries from "./timeseries.js";
import $topn from "./top-n.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * query command group
 * @generated from apis/overlays/analytics.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "query",
	describe: "Operations for query",

	builder: (yargs) => {
		return yargs
			.command($summary)
			.command($timeseries)
			.command($topn)
			.command($datasecurity)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
