import $bulkcreate from "./bulk-create.js";
import $bulkdelete from "./bulk-delete.js";
import $bulkupdate from "./bulk-update.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * labels command group
 * @generated from apis/overlays/web-assets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "labels",
	describe: "Operations for operations.labels",

	builder: (yargs) => {
		return yargs
			.command($bulkcreate)
			.command($bulkdelete)
			.command($bulkupdate)
			.command($create)
			.command($delete)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
