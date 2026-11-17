import $bulkcreate from "./bulk-create.js";
import $bulkdelete from "./bulk-delete.js";
import $bulkreplacetags from "./bulk-replace-tags.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * targets command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "targets",
	describe: "Operations for access.targets",

	builder: (yargs) => {
		return yargs
			.command($bulkcreate)
			.command($bulkdelete)
			.command($bulkreplacetags)
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
