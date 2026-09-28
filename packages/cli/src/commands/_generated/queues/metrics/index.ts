import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * metrics command group
 * @generated from apis/overlays/queues.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "metrics",
	describe: "Operations for metrics",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
