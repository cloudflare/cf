import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * alerts command
 * @generated from apis/overlays/alerts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "alerts",
	describe: "alerts",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
