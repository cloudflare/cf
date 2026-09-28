import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * export command group
 * @generated from apis/overlays/zaraz.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "export",
	describe:
		"Export the current Zaraz configuration as a portable JSON document",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
