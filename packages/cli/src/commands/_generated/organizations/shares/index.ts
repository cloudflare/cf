import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * shares command group
 * @generated from apis/overlays/organizations.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "shares",
	describe: "Shares across the organization",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
