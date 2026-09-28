import $export from "./export.js";
import $generate from "./generate.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * summaries command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "summaries",
	describe: "Summaries of historical RealtimeKit sessions",

	builder: (yargs) => {
		return yargs
			.command($export)
			.command($generate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
