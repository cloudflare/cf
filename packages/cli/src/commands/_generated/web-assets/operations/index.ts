import $bulkcreate from "./bulk-create.js";
import $bulkdelete from "./bulk-delete.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $labels from "./labels/index.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * operations command group
 * @generated from apis/overlays/web-assets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "operations",
	describe: "Operations for operations",

	builder: (yargs) => {
		return yargs
			.command($bulkcreate)
			.command($bulkdelete)
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($labels)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
