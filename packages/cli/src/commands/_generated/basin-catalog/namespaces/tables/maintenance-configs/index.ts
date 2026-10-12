import $get from "./get.js";
import $queue from "./queue.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * maintenance-configs command group
 * @generated from apis/overlays/basin-catalog.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "maintenance-configs",
	describe: "Table-level maintenance configurations and operations",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($queue)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
