import $rule from "./rule.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * protection command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "protection",
	describe:
		"Operations for advanced-dns-protection.configs.dns.protection.rules.delete.protection",

	builder: (yargs) => {
		return yargs.command($rule).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
