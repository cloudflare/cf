import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * reports command group
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "reports",
	describe: "Operations for phishguard.reports",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
