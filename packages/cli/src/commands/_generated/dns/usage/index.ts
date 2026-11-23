import $account from "./account/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * usage command group
 * @generated from apis/overlays/dns.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "usage",
	describe: "Operations for usage",

	builder: (yargs) => {
		return yargs
			.command($account)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
