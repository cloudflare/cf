import $accounttoolcallanalytics from "./account-tool-call-analytics.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $read from "./read.js";
import $toolcallanalytics from "./tool-call-analytics.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * portals command group
 * @generated from apis/overlays/mcp.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "portals",
	describe: "Manage MCP portals, attached servers, and Code Mode settings",

	builder: (yargs) => {
		return yargs
			.command($accounttoolcallanalytics)
			.command($create)
			.command($delete)
			.command($list)
			.command($read)
			.command($toolcallanalytics)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
