import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * membership command group
 * @generated from apis/overlays/tenant.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "membership",
	describe: "Operations for membership",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
