import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * regions command group
 * @generated from apis/overlays/workers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "regions",
	describe: "Operations for placement.regions",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
