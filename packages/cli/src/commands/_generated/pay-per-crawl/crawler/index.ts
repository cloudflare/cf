import $stripe from "./stripe/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * crawler command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "crawler",
	describe: "Operations for crawler",

	builder: (yargs) => {
		return yargs
			.command($stripe)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
