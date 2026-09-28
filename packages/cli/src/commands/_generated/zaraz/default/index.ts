import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * default command group
 * @generated from apis/overlays/zaraz.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "default",
	describe:
		"Default Zaraz configuration template used as a starting point for new zones",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
