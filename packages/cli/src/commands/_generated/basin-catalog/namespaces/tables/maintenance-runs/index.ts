import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * maintenance-runs command group
 * @generated from apis/overlays/basin-catalog.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "maintenance-runs",
	describe: "History of maintenance runs performed on tables",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
