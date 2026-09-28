import $cancel from "./cancel.js";
import $create from "./create.js";
import $get from "./get.js";
import $list from "./list.js";
import $logs from "./logs.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * jobs command group
 * @generated from apis/overlays/ai-search.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "jobs",
	describe: "Indexing job lifecycle for AI Search instances",

	builder: (yargs) => {
		return yargs
			.command($cancel)
			.command($create)
			.command($get)
			.command($list)
			.command($logs)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
