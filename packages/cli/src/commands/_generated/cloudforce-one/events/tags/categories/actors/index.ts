import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * actors command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "actors",
	describe: "Operations for events.tags.categories.actors",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
