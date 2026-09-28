import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * searches command group
 * @generated from apis/overlays/load-balancers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "searches",
	describe:
		"Search across all load balancer resources (pools, monitors, load balancers) by name or reference",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
