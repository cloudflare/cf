import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * metadata-index command group
 * @generated from apis/overlays/vectorize.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "metadata-index",
	describe: "Operations for metadata-index",

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
