import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $permissiongroups from "./permission-groups/index.js";
import $roll from "./roll.js";
import $update from "./update.js";
import $verify from "./verify.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tokens command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tokens",
	describe:
		"Create and manage personal API tokens scoped to your user for programmatic API access",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($roll)
			.command($update)
			.command($verify)
			.command($permissiongroups)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
