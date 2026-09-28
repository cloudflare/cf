import $clear from "./clear.js";
import $status from "./status.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * cache-reserve-clear command group
 * @generated from apis/overlays/smart-shield.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "cache-reserve-clear",
	describe: "Cache Reserve Clear operations",

	builder: (yargs) => {
		return yargs
			.command($clear)
			.command($status)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
