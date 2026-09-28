import $bulkcreate from "./bulk-create.js";
import $bulkdelete from "./bulk-delete.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $operations from "./operations/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * user command group
 * @generated from apis/overlays/web-assets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "user",
	describe: "Operations for labels.user",

	builder: (yargs) => {
		return yargs
			.command($bulkcreate)
			.command($bulkdelete)
			.command($delete)
			.command($edit)
			.command($get)
			.command($update)
			.command($operations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
