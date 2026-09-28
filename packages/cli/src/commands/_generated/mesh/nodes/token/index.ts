import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * token command group
 * @generated from apis/overlays/mesh.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "token",
	describe: "Operations for nodes.token",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
