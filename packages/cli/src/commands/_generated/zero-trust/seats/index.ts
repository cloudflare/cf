import $edit from "./edit.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * seats command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "seats",
	describe: "Operations for seats",

	builder: (yargs) => {
		return yargs.command($edit).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
