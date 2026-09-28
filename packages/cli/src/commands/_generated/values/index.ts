import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * values command
 * @generated from apis/overlays/values.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "values",
	describe: "values",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
