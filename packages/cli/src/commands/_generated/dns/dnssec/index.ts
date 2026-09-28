import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dnssec command group
 * @generated from apis/overlays/dns.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dnssec",
	describe: "Operations for dnssec",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
