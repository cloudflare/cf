import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * versions command group
 * @generated from apis/overlays/logpush.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "versions",
	describe: "Operations for transformers.versions",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
