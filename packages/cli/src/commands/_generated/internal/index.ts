import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * internal command
 * @generated from apis/overlays/internal.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "internal",
	describe: "internal",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
