import $edge from "./edge/index.js";
import $transformers from "./transformers/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * logpush command
 * @generated from apis/overlays/logpush.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "logpush",
	describe: "logpush",

	builder: (yargs) => {
		return yargs
			.command($edge)
			.command($transformers)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
