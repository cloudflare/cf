import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * domain-history command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "domain-history",
	describe:
		"Historical domain registration and categorization changes over time",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
