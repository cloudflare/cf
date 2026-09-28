import $events from "./events/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * leaks command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "leaks",
	describe: "Operations for bgp.leaks",

	builder: (yargs) => {
		return yargs
			.command($events)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
