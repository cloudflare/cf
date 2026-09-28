import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * jobs command group
 * @generated from apis/overlays/r2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "jobs",
	describe: "Inspect background jobs for an R2 bucket",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
