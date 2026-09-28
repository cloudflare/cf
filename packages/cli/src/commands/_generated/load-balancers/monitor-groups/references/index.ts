import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * references command group
 * @generated from apis/overlays/load-balancers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "references",
	describe: "List references to monitor groups used by load balancer pools",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
