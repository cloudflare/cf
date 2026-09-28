import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * authors command group
 * @generated from apis/overlays/ai.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "authors",
	describe: "Operations for authors",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
