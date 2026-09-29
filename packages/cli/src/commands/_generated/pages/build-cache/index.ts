import $purge from "./purge.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * build-cache command group
 * @generated from apis/overlays/pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "build-cache",
	describe: "Operations for build-cache",

	builder: (yargs) => {
		return yargs
			.command($purge)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
