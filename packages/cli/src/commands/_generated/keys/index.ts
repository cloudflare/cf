import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * keys command
 * @generated from apis/overlays/keys.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "keys",
	describe: "keys",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
