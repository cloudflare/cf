import $dns from "./dns/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * configs command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "configs",
	describe: "Operations for advanced-dns-protection.configs",

	builder: (yargs) => {
		return yargs.command($dns).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
