import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import $users from "./users/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * user-populations command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "user-populations",
	describe: "Operations for access.user-populations",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($users)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
