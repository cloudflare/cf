import $get from "./get.js";
import $list from "./list.js";
import $respond from "./respond.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * invites command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "invites",
	describe: "Operations for invites",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.command($respond)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
