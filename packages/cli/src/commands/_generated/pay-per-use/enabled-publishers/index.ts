import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * enabled-publishers command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "enabled-publishers",
	describe: "Operations for enabled-publishers",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
