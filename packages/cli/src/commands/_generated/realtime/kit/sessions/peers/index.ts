import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * peers command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "peers",
	describe: "Peer details from historical RealtimeKit sessions",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
