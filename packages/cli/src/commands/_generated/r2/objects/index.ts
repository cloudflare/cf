import $bulkdelete from "./bulk-delete.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $put from "./put.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * objects command group
 * @generated from apis/overlays/r2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "objects",
	describe: "Operations for objects",

	builder: (yargs) => {
		return yargs
			.command($bulkdelete)
			.command($delete)
			.command($get)
			.command($list)
			.command($put)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
