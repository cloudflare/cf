import $get from "./get.js";
import $graph from "./graph.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * versions command group
 * @generated from apis/overlays/workflows.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "versions",
	describe: "Workflow version operations",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($graph)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
