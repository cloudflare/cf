import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * messages command group
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "messages",
	describe: "Operations for investigate.bulk.messages",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
