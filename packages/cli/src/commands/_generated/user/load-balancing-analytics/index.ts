import $events from "./events/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * load-balancing-analytics command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "load-balancing-analytics",
	describe: "Operations for load-balancing-analytics",

	builder: (yargs) => {
		return yargs
			.command($events)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
