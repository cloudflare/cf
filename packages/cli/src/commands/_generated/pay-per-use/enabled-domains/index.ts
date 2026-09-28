import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * enabled-domains command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "enabled-domains",
	describe: "Operations for enabled-domains",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
