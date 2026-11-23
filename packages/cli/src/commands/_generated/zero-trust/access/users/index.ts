import $activesessions from "./active-sessions/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $failedlogins from "./failed-logins/index.js";
import $get from "./get.js";
import $lastseenidentity from "./last-seen-identity/index.js";
import $list from "./list.js";
import $revoke from "./revoke.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * users command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "users",
	describe: "Operations for access.users",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($revoke)
			.command($update)
			.command($activesessions)
			.command($failedlogins)
			.command($lastseenidentity)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
