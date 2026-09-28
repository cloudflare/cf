import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * config-autofill command group
 * @generated from apis/overlays/builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "config-autofill",
	describe: "Operations for repos.config-autofill",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
