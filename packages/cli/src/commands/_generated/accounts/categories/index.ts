import $get from "./get/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * categories command group
 * @generated from apis/overlays/accounts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "categories",
	describe: "Categories operations",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
