import $cache from "./cache/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $environmentvariables from "./environment-variables/index.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * triggers command group
 * @generated from apis/overlays/builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "triggers",
	describe: "Configure how repository changes build and deploy Workers.",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($list)
			.command($update)
			.command($cache)
			.command($environmentvariables)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
