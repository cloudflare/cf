import $list from "./list.js";
import $start from "./start.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * scans command group
 * @generated from apis/overlays/security-insights.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "scans",
	describe: "Operations for scans",

	builder: (yargs) => {
		return yargs
			.command($list)
			.command($start)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
