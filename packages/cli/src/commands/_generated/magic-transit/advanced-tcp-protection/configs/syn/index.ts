import $protection from "./protection/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * syn command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "syn",
	describe: "Operations for advanced-tcp-protection.configs.syn",

	builder: (yargs) => {
		return yargs
			.command($protection)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
