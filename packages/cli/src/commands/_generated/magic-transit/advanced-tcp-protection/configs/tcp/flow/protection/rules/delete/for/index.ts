import $account from "./account.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * for command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "for",
	describe:
		"Operations for advanced-tcp-protection.configs.tcp.flow.protection.rules.delete.for",

	builder: (yargs) => {
		return yargs
			.command($account)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
