import $bulkdelete from "./bulk-delete.js";
import $bulk from "./bulk/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * prefixes command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "prefixes",
	describe: "Operations for advanced-tcp-protection.configs.prefixes",

	builder: (yargs) => {
		return yargs
			.command($bulkdelete)
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($bulk)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
