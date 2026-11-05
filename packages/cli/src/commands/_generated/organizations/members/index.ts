import $batch from "./batch/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * members command group
 * @generated from apis/overlays/organizations.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "members",
	describe: "Members of an organization",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($batch)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
