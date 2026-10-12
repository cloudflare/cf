import $sessions from "./sessions/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * agents command group
 * @generated from apis/overlays/o11y.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "agents",
	describe: "Operations for agents",

	builder: (yargs) => {
		return yargs
			.command($sessions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
