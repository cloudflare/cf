import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * verify command
 * @generated from apis/overlays/verify.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "verify",
	describe: "verify",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
