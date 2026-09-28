import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * account-waiting-rooms command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "account-waiting-rooms",
	describe: "Account-scoped waiting room listing",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
