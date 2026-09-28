import $list from "./list.js";
import $tables from "./tables/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * namespaces command group
 * @generated from apis/overlays/r2-data-catalog.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "namespaces",
	describe:
		"Logical namespaces that group related tables within the data catalog",

	builder: (yargs) => {
		return yargs
			.command($list)
			.command($tables)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
