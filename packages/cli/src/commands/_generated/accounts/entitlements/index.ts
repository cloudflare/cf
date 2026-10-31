import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * entitlements command group
 * @generated from apis/overlays/accounts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "entitlements",
	describe: "Operations for entitlements",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
