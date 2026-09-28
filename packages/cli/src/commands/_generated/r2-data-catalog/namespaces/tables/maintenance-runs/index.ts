import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * maintenance-runs command group
 * @generated from apis/overlays/r2-data-catalog.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "maintenance-runs",
	describe: "Operations for namespaces.tables.maintenance-runs",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
