import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * leases command group
 * @generated from apis/overlays/addressing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "leases",
	describe: "Operations for leases",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
