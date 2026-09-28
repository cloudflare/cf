import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * regions command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "regions",
	describe: "Operations for load-balancers.regions",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
