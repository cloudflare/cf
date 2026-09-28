import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * versions command group
 * @generated from apis/overlays/builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "versions",
	describe: "Find builds associated with Worker versions.",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
