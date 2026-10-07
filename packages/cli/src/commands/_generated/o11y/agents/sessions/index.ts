import $list from "./list.js";
import $runs from "./runs.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * sessions command group
 * @generated from apis/overlays/o11y.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "sessions",
	describe: "Operations for agents.sessions",

	builder: (yargs) => {
		return yargs
			.command($list)
			.command($runs)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
