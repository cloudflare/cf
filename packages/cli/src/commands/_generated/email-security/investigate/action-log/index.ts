import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * action-log command group
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "action-log",
	describe: "Operations for investigate.action-log",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
