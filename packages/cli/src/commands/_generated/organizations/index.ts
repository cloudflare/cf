import $accounts from "./accounts/index.js";
import $billing from "./billing/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $invites from "./invites/index.js";
import $list from "./list.js";
import $logs from "./logs/index.js";
import $members from "./members/index.js";
import $profile from "./profile/index.js";
import $shares from "./shares/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * organizations command
 * @generated from apis/overlays/organizations.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "organizations",
	describe:
		"Multi-user organizations that group accounts, members, and shared settings under a single entity",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($accounts)
			.command($billing)
			.command($invites)
			.command($logs)
			.command($members)
			.command($profile)
			.command($shares)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
