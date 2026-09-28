import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * connections command group
 * @generated from apis/overlays/mesh.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "connections",
	describe: "Operations for nodes.connections",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
