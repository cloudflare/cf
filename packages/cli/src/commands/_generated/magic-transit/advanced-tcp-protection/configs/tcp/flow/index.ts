import $protection from "./protection/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * flow command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "flow",
	describe: "Operations for advanced-tcp-protection.configs.tcp.flow",

	builder: (yargs) => {
		return yargs
			.command($protection)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
