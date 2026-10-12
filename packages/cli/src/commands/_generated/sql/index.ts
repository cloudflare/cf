import $datasets from "./datasets.js";
import $query from "./query.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * sql command
 * @generated from apis/overlays/sql.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "sql",
	describe: "sql",

	builder: (yargs) => {
		return yargs
			.command($datasets)
			.command($query)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
