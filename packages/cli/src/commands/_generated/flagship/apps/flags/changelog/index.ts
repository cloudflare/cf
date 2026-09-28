import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * changelog command group
 * @generated from apis/overlays/flagship.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "changelog",
	describe: "Operations for apps.flags.changelog",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
