import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * search command
 * @generated from apis/overlays/search.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "search",
	describe: "search",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
