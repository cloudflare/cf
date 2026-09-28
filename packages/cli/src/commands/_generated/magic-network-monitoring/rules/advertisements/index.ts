import $edit from "./edit.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * advertisements command group
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "advertisements",
	describe: "Operations for rules.advertisements",

	builder: (yargs) => {
		return yargs.command($edit).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
