import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * objects command group
 * @generated from apis/overlays/durable-objects.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "objects",
	describe: "Operations for namespaces.objects",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
