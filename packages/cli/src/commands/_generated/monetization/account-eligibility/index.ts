import $check from "./check.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * account-eligibility command group
 * @generated from apis/overlays/monetization.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "account-eligibility",
	describe: "Operations for account-eligibility",

	builder: (yargs) => {
		return yargs
			.command($check)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
