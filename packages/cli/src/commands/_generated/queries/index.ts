import $bulk from "./bulk/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * queries command
 * @generated from apis/overlays/queries.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "queries",
	describe: "queries",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($bulk)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
