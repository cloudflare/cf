import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import $usage from "./usage/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * account command group
 * @generated from apis/overlays/load-balancers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "account",
	describe: "Operations for account",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($update)
			.command($usage)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
