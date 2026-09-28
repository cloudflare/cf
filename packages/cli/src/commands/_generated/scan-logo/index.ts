import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * scan-logo command
 * @generated from apis/overlays/scan-logo.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "scan-logo",
	describe: "scan-logo",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
