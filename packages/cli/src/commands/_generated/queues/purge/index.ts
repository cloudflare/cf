import $start from "./start.js";
import $status from "./status.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * purge command group
 * @generated from apis/overlays/queues.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "purge",
	describe: "Remove all pending messages from a queue",

	builder: (yargs) => {
		return yargs
			.command($start)
			.command($status)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
