import $inspect from "./inspect.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * spf command group
 * @generated from apis/overlays/email-auth.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "spf",
	describe: "Operations for spf",

	builder: (yargs) => {
		return yargs
			.command($inspect)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
