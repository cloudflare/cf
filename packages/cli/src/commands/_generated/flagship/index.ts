import $apps from "./apps/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * flagship command
 * @generated from apis/overlays/flagship.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "flagship",
	describe: "flagship",

	builder: (yargs) => {
		return yargs.command($apps).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
