import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * values command group
 * @generated from apis/overlays/tags.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "values",
	describe: "Operations for values",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
