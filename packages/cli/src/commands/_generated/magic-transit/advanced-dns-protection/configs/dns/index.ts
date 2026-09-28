import $protection from "./protection/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dns command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dns",
	describe: "Operations for advanced-dns-protection.configs.dns",

	builder: (yargs) => {
		return yargs
			.command($protection)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
