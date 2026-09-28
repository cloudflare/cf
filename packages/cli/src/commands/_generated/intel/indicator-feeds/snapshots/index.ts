import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * snapshots command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "snapshots",
	describe: "Operations for indicator-feeds.snapshots",

	builder: (yargs) => {
		return yargs
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
