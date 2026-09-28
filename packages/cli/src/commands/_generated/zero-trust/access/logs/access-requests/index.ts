import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * access-requests command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "access-requests",
	describe: "Operations for access.logs.access-requests",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
