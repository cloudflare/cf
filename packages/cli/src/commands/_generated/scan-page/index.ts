import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * scan-page command
 * @generated from apis/overlays/scan-page.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "scan-page",
	describe: "scan-page",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
