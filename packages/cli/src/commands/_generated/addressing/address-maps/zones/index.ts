import $deletebulk from "./delete-bulk.js";
import $delete from "./delete.js";
import $updatebulk from "./update-bulk.js";
import $update from "./update.js";
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
			.command($delete)
			.command($deletebulk)
			.command($update)
			.command($updatebulk)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
