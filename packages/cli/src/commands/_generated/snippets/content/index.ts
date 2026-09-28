import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * content command group
 * @generated from apis/overlays/snippets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "content",
	describe: "Operations for content",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
