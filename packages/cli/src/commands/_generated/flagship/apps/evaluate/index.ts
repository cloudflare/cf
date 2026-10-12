import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * evaluate command group
 * @generated from apis/overlays/flagship.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "evaluate",
	describe: "Operations for apps.evaluate",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
