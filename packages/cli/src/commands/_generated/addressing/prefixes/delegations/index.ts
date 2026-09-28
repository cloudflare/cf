import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * delegations command group
 * @generated from apis/overlays/addressing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "delegations",
	describe: "Operations for prefixes.delegations",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
