import $aggregates from "./aggregates/index.js";
import $events from "./events/index.js";
import $zones from "./zones/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * analytics command group
 * @generated from apis/overlays/spectrum.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "analytics",
	describe:
		"Real-time and historical connection analytics for Spectrum applications",

	builder: (yargs) => {
		return yargs
			.command($aggregates)
			.command($events)
			.command($zones)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
