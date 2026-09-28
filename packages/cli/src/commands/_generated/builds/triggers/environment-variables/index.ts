import $delete from "./delete.js";
import $list from "./list.js";
import $upsert from "./upsert.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * environment-variables command group
 * @generated from apis/overlays/builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "environment-variables",
	describe: "Operations for triggers.environment-variables",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($list)
			.command($upsert)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
