import $export from "./export.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * chat command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "chat",
	describe: "Chat messages from historical RealtimeKit sessions",

	builder: (yargs) => {
		return yargs
			.command($export)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
