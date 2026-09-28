import $purge from "./purge.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * cache command group
 * @generated from apis/overlays/builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "cache",
	describe: "Operations for triggers.cache",

	builder: (yargs) => {
		return yargs
			.command($purge)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
