import $getbookmark from "./get-bookmark.js";
import $restore from "./restore.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * time-travel command group
 * @generated from apis/overlays/d1.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "time-travel",
	describe: "use specific point-in-time backups of your D1 database",

	builder: (yargs) => {
		return yargs
			.command($getbookmark)
			.command($restore)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
