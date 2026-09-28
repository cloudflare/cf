import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * share command group
 * @generated from apis/overlays/organization.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "share",
	describe: "Operations for share",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
