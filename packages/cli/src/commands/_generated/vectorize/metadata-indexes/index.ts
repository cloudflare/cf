import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * metadata-indexes command group
 * @generated from apis/overlays/vectorize.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "metadata-indexes",
	describe: "Metadata indexes for filtered vector search",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
