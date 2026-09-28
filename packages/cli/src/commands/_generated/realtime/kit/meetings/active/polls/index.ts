import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * polls command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "polls",
	describe: "Polls for active meeting sessions",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
