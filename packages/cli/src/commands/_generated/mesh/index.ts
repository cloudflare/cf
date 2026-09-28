import $nodes from "./nodes/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * mesh command
 * @generated from apis/overlays/mesh.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "mesh",
	describe: "mesh",

	builder: (yargs) => {
		return yargs
			.command($nodes)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
