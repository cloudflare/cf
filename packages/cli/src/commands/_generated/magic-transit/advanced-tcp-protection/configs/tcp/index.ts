import $flow from "./flow/index.js";
import $protection from "./protection/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tcp command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tcp",
	describe: "Operations for advanced-tcp-protection.configs.tcp",

	builder: (yargs) => {
		return yargs
			.command($flow)
			.command($protection)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
