import $submit from "./submit.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * usage-reports command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "usage-reports",
	describe: "Operations for usage-reports",

	builder: (yargs) => {
		return yargs
			.command($submit)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
