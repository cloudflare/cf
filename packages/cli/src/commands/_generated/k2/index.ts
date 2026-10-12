import $streams from "./streams/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * k2 command
 * @generated from apis/overlays/k2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "k2",
	describe:
		"Durable, ordered event streams that you produce records to and consume from with subscriptions",

	builder: (yargs) => {
		return yargs
			.command($streams)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
