import $configautofill from "./config-autofill/index.js";
import $connections from "./connections/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * repos command group
 * @generated from apis/overlays/builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "repos",
	describe: "Manage source repository connections for Workers Builds.",

	builder: (yargs) => {
		return yargs
			.command($configautofill)
			.command($connections)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
