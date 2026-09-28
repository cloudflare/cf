import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * services command group
 * @generated from apis/overlays/addressing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "services",
	describe: "Operations for services",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
