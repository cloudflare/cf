import $datasets from "./datasets/index.js";
import $events from "./events/index.js";
import $indicators from "./indicators/index.js";
import $search from "./search.js";
import $tags from "./tags/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * threat-intel command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "threat-intel",
	describe: "Operations for threat-intel",

	builder: (yargs) => {
		return yargs
			.command($search)
			.command($datasets)
			.command($events)
			.command($indicators)
			.command($tags)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
