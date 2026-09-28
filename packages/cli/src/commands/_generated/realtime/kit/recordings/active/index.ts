import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * active command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "active",
	describe: "Active recordings for RealtimeKit meetings",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
