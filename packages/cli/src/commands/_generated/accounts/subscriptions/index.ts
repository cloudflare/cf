import $cancelDelayedDowngrade from "./cancelDelayedDowngrade.js";
import $create from "./create.js";
import $createCancelReason from "./createCancelReason.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $getByIdentifier from "./getByIdentifier.js";
import $getCancelReason from "./getCancelReason.js";
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
			.command($cancelDelayedDowngrade)
			.command($create)
			.command($createCancelReason)
			.command($delete)
			.command($get)
			.command($getByIdentifier)
			.command($getCancelReason)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
