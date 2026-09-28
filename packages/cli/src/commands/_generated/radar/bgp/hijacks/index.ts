import $events from "./events/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * hijacks command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "hijacks",
	describe: "Operations for bgp.hijacks",

	builder: (yargs) => {
		return yargs
			.command($events)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
