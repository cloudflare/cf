import $filters from "./filters/index.js";
import $rules from "./rules/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * protection command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "protection",
	describe:
		"Operations for advanced-tcp-protection.configs.tcp.flow.protection",

	builder: (yargs) => {
		return yargs
			.command($filters)
			.command($rules)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
