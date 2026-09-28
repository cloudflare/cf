import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * logs command group
 * @generated from apis/overlays/builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "logs",
	describe: "Retrieve build logs.",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
