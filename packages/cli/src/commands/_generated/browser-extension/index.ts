import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * browser-extension command
 * @generated from apis/overlays/browser-extension.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "browser-extension",
	describe: "browser-extension",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
