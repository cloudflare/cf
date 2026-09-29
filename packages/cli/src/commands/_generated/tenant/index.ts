import $accounttype from "./account-type/index.js";
import $account from "./account/index.js";
import $entitlement from "./entitlement/index.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tenant command
 * @generated from apis/overlays/tenant.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tenant",
	describe: "tenant",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($account)
			.command($accounttype)
			.command($entitlement)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
