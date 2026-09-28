import $clear from "./clear.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $status from "./status.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * reserve command group
 * @generated from apis/overlays/cache.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "reserve",
	describe:
		"Persistent storage tier that keeps cached assets even after eviction from edge caches",

	builder: (yargs) => {
		return yargs
			.command($clear)
			.command($edit)
			.command($get)
			.command($status)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
