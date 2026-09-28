import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * transformations command group
 * @generated from apis/overlays/accounts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "transformations",
	describe: "Operations for transformations",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
