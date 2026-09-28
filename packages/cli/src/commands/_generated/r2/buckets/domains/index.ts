import $custom from "./custom/index.js";
import $managed from "./managed/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * domains command group
 * @generated from apis/overlays/r2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "domains",
	describe: "Operations for buckets.domains",

	builder: (yargs) => {
		return yargs
			.command($custom)
			.command($managed)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
