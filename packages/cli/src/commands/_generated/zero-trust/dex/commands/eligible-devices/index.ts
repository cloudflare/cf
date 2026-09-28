import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * eligible-devices command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "eligible-devices",
	describe: "Operations for dex.commands.eligible-devices",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
