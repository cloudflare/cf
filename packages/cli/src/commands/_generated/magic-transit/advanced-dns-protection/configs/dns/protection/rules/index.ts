import $create from "./create.js";
import $delete from "./delete/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rules command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rules",
	describe:
		"Operations for advanced-dns-protection.configs.dns.protection.rules",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($get)
			.command($list)
			.command($update)
			.command($delete)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
