import $edit from "./edit.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * csam-scanner command
 * @generated from apis/overlays/csam-scanner.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "csam-scanner",
	describe: "csam-scanner",

	builder: (yargs) => {
		return yargs
			.command($edit)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
