import $create from "./create.js";
import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * storage-class-migration-jobs command group
 * @generated from apis/overlays/r2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "storage-class-migration-jobs",
	describe: "Operations for buckets.storage-class-migration-jobs",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($get)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
