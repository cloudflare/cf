import $delete from "./delete.js";
import $replace from "./replace.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * connections command group
 * @generated from apis/overlays/builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "connections",
	describe: "Operations for repos.connections",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($replace)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
