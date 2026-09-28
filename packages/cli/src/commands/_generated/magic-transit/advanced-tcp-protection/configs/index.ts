import $allowlist from "./allowlist/index.js";
import $prefixes from "./prefixes/index.js";
import $syn from "./syn/index.js";
import $tcp from "./tcp/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * configs command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "configs",
	describe: "Operations for advanced-tcp-protection.configs",

	builder: (yargs) => {
		return yargs
			.command($allowlist)
			.command($prefixes)
			.command($syn)
			.command($tcp)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
