import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * daily command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "daily",
	describe: "Daily livestream analytics for RealtimeKit applications",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
