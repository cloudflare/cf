import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $members from "./members/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * user-groups command group
 * @generated from apis/overlays/iam.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "user-groups",
	describe:
		"Organize account members into groups for easier permission assignment",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($members)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
