import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
import $userMembershipsGet from "./userMembershipsGet.js";
import $userSAccountMembershipsMembershipDetails from "./userSAccountMembershipsMembershipDetails.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * memberships command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "memberships",
	describe: "Operations for memberships",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($list)
			.command($update)
			.command($userMembershipsGet)
			.command($userSAccountMembershipsMembershipDetails)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
