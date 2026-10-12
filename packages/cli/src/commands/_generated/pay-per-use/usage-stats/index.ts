import $getaccount from "./get-account.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * usage-stats command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "usage-stats",
	describe: "Operations for usage-stats",

	builder: (yargs) => {
		return yargs
			.command($getaccount)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
