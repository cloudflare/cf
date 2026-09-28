import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * statuses command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "statuses",
	describe:
		"Real-time queue status showing active users, queued users, and estimated wait times",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
