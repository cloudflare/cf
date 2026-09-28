import $prefix from "./prefix.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * allowlist command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "allowlist",
	describe:
		"Operations for advanced-tcp-protection.configs.allowlist.delete.allowlist",

	builder: (yargs) => {
		return yargs
			.command($prefix)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
