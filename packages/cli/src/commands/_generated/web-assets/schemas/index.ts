import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * schemas command group
 * @generated from apis/overlays/web-assets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "schemas",
	describe: "Operations for schemas",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
