import $allowlist from "./allowlist/index.js";
import $for from "./for/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * delete command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "delete",
	describe: "Operations for advanced-tcp-protection.configs.allowlist.delete",

	builder: (yargs) => {
		return yargs
			.command($allowlist)
			.command($for)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
