import $list from "./list.js";
import $objects from "./objects/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * namespaces command group
 * @generated from apis/overlays/durable-objects.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "namespaces",
	describe: "Operations for namespaces",

	builder: (yargs) => {
		return yargs
			.command($list)
			.command($objects)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
