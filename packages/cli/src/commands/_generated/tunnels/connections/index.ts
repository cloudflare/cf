import $cleanup from "./cleanup.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * connections command group
 * @generated from apis/overlays/tunnels.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "connections",
	describe: "Operations for connections",

	builder: (yargs) => {
		return yargs
			.command($cleanup)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
