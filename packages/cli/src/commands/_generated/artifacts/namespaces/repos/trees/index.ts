import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * trees command group
 * @generated from apis/overlays/artifacts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "trees",
	describe: "Operations for namespaces.repos.trees",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
