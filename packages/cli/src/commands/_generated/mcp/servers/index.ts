import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $read from "./read.js";
import $sync from "./sync.js";
import $toolcallanalytics from "./tool-call-analytics.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * servers command group
 * @generated from apis/overlays/mcp.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "servers",
	describe: "Operations for servers",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($list)
			.command($read)
			.command($sync)
			.command($toolcallanalytics)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
