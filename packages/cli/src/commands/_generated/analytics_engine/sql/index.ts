import $query from "./query.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * sql command group
 * @generated from apis/overlays/analytics_engine.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "sql",
	describe: "Operations for sql",

	builder: (yargs) => {
		return yargs
			.command($query)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
