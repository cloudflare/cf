import $bulkdelete from "./bulk-delete.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $duplicate from "./duplicate.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * secrets command group
 * @generated from apis/overlays/secrets-store.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "secrets",
	describe:
		"Encrypted key-value secrets within a store. Pass --store-id to scope.",

	builder: (yargs) => {
		return yargs
			.command($bulkdelete)
			.command($create)
			.command($delete)
			.command($duplicate)
			.command($edit)
			.command($get)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
