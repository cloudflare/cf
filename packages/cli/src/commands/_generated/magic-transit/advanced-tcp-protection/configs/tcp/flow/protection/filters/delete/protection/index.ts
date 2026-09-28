import $filter from "./filter.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * protection command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "protection",
	describe:
		"Operations for advanced-tcp-protection.configs.tcp.flow.protection.filters.delete.protection",

	builder: (yargs) => {
		return yargs
			.command($filter)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
