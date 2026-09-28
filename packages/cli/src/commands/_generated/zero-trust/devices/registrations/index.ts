import $bulkdelete from "./bulk-delete.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $overridecodes from "./override-codes/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * registrations command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "registrations",
	describe: "Operations for devices.registrations",

	builder: (yargs) => {
		return yargs
			.command($bulkdelete)
			.command($delete)
			.command($get)
			.command($list)
			.command($overridecodes)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
