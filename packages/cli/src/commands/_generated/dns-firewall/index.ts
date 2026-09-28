import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $reversedns from "./reverse-dns/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dns-firewall command
 * @generated from apis/overlays/dns-firewall.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dns-firewall",
	describe: "dns-firewall",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($reversedns)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
