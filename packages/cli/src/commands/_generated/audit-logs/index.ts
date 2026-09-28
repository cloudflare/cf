import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * audit-logs command
 * @generated from apis/overlays/audit-logs.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "audit-logs",
	describe: "audit-logs",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
