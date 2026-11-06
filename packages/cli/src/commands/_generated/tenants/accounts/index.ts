import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * accounts command group
 * @generated from apis/overlays/tenants.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "accounts",
	describe: "Accounts that belong to a tenant",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
