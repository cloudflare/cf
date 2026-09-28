import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * recent-submissions command
 * @generated from apis/overlays/recent-submissions.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "recent-submissions",
	describe: "recent-submissions",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
