import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * bulk-operations command group
 * @generated from apis/overlays/rules.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "bulk-operations",
	describe: "Operations for lists.bulk-operations",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
