import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * public command group
 * @generated from apis/overlays/ai.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "public",
	describe: "Operations for finetunes.public",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
