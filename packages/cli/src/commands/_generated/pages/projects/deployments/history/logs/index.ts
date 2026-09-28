import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * logs command group
 * @generated from apis/overlays/pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "logs",
	describe: "Operations for projects.deployments.history.logs",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
