import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * limits command group
 * @generated from apis/overlays/builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "limits",
	describe: "View build-minute availability and refresh information.",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
