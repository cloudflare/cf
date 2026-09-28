import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * logo-matches command group
 * @generated from apis/overlays/brand-protection.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "logo-matches",
	describe: "Operations for logo-matches",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
