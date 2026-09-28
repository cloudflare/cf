import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tasks command group
 * @generated from apis/overlays/ai.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tasks",
	describe: "Operations for tasks",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
