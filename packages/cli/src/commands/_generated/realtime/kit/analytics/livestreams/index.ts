import $daily from "./daily/index.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * livestreams command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "livestreams",
	describe: "Livestream analytics for RealtimeKit applications",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($daily)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
