import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * usage command group
 * @generated from apis/overlays/load-balancers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "usage",
	describe: "Current load balancer resource usage counts for an account",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
