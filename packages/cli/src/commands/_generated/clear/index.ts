import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * clear command
 * @generated from apis/overlays/clear.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "clear",
	describe: "clear",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
