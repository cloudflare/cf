import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * models command group
 * @generated from apis/overlays/ai.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "models",
	describe: "Operations for models",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
