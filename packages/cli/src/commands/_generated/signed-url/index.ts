import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * signed-url command
 * @generated from apis/overlays/signed-url.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "signed-url",
	describe: "signed-url",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
