import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * failed-logins command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "failed-logins",
	describe: "Operations for access.users.failed-logins",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
