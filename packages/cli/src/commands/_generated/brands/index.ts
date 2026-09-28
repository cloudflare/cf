import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * brands command
 * @generated from apis/overlays/brands.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "brands",
	describe: "brands",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
