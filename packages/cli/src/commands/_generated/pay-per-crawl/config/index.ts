import $create from "./create.js";
import $edit from "./edit.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * config command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "config",
	describe: "Operations for config",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($edit)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
