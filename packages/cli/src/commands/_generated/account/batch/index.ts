import $move from "./move.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * batch command group
 * @generated from apis/overlays/account.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "batch",
	describe: "Operations for batch",

	builder: (yargs) => {
		return yargs.command($move).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
