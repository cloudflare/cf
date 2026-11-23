import $canceldelayeddowngrade from "./cancel-delayed-downgrade.js";
import $createcancelreason from "./create-cancel-reason.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $getbyidentifier from "./get-by-identifier.js";
import $getcancelreason from "./get-cancel-reason.js";
import $get from "./get.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * subscriptions command group
 * @generated from apis/overlays/accounts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "subscriptions",
	describe: "View and manage plan subscriptions attached to this account",

	builder: (yargs) => {
		return yargs
			.command($canceldelayeddowngrade)
			.command($create)
			.command($createcancelreason)
			.command($delete)
			.command($get)
			.command($getbyidentifier)
			.command($getcancelreason)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
