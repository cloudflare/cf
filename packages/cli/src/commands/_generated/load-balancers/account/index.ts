import $usage from "./usage/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * account command group
 * @generated from apis/overlays/load-balancers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "account",
	describe:
		"Account-scoped load balancers that distribute traffic without requiring a DNS hostname",

	builder: (yargs) => {
		return yargs
			.command($usage)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
