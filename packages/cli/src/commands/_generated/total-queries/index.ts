import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * total-queries command
 * @generated from apis/overlays/total-queries.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "total-queries",
	describe: "total-queries",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
