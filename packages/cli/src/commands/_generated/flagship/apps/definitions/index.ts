import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * definitions command group
 * @generated from apis/overlays/flagship.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "definitions",
	describe: "Operations for apps.definitions",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
