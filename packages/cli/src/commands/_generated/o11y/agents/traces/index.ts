import $events from "./events.js";
import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * traces command group
 * @generated from apis/overlays/o11y.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "traces",
	describe: "Operations for agents.traces",

	builder: (yargs) => {
		return yargs
			.command($events)
			.command($get)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
