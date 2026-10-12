import $decide from "./decide.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * proposals command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "proposals",
	describe: "Operations for proposals",

	builder: (yargs) => {
		return yargs
			.command($decide)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
