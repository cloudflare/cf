import $create from "./create.js";
import $delete from "./delete/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * filters command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "filters",
	describe:
		"Operations for advanced-tcp-protection.configs.syn.protection.filters",

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
