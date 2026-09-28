import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * network command group
 * @generated from apis/overlays/browser-run.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "network",
	describe: "Operations for recording.network",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
