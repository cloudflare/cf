import $accounts from "./accounts/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tenants command
 * @generated from apis/overlays/tenants.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tenants",
	describe: "Multi-tenant account management",

	builder: (yargs) => {
		return yargs
			.command($accounts)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
