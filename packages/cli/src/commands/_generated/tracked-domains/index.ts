import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tracked-domains command
 * @generated from apis/overlays/tracked-domains.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tracked-domains",
	describe: "tracked-domains",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
