import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * account command group
 * @generated from apis/overlays/dns.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "account",
	describe: "Operations for usage.account",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
