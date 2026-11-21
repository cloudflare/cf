import $bulkcreate from "./bulk-create.js";
import $bulkdelete from "./bulk-delete.js";
import $create from "./create.js";
import $delete from "./delete.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * zones command group
 * @generated from apis/overlays/addressing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "zones",
	describe: "Operations for address-maps.zones",

	builder: (yargs) => {
		return yargs
			.command($bulkcreate)
			.command($bulkdelete)
			.command($create)
			.command($delete)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
