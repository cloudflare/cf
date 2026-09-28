import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * domain-info command
 * @generated from apis/overlays/domain-info.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "domain-info",
	describe: "domain-info",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
