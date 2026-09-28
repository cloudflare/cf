import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * categories command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "categories",
	describe: "Operations for gateway.categories",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
