import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tenant command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tenant",
	describe: "Operations for tenant",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
