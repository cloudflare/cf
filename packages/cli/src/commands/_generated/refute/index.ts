import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * refute command
 * @generated from apis/overlays/refute.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "refute",
	describe: "refute",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
