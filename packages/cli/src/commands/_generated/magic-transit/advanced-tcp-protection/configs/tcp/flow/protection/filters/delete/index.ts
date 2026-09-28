import $for from "./for/index.js";
import $protection from "./protection/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * delete command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "delete",
	describe:
		"Operations for advanced-tcp-protection.configs.tcp.flow.protection.filters.delete",

	builder: (yargs) => {
		return yargs
			.command($for)
			.command($protection)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
