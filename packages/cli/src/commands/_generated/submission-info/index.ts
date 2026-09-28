import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * submission-info command
 * @generated from apis/overlays/submission-info.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "submission-info",
	describe: "submission-info",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
