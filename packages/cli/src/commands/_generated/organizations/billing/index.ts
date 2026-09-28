import $usage from "./usage/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * billing command group
 * @generated from apis/overlays/organizations.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "billing",
	describe: "Operations for billing",

	builder: (yargs) => {
		return yargs
			.command($usage)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
