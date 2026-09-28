import $operator from "./operator/index.js";
import $pricing from "./pricing/index.js";
import $proposals from "./proposals/index.js";
import $usagestats from "./usage-stats/index.js";
import $zones from "./zones/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * pay-per-use command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "pay-per-use",
	describe: "Operations for pay-per-use",

	builder: (yargs) => {
		return yargs
			.command($operator)
			.command($pricing)
			.command($proposals)
			.command($usagestats)
			.command($zones)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
