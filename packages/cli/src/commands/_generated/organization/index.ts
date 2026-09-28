import $account from "./account/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $invite from "./invite/index.js";
import $list from "./list.js";
import $member from "./member/index.js";
import $profile from "./profile/index.js";
import $share from "./share/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * organization command
 * @generated from apis/overlays/organization.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "organization",
	describe: "organization",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($account)
			.command($invite)
			.command($member)
			.command($profile)
			.command($share)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
