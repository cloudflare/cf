import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ready command
 * @generated from apis/overlays/ready.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ready",
	describe: "ready",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
