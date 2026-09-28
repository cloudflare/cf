import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * autorag command
 * @generated from apis/overlays/autorag.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "autorag",
	describe: "autorag",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
