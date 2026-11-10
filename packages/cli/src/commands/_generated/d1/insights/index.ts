import $databases from "./databases.js";
import $queries from "./queries.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * insights command group
 * @generated from apis/overlays/d1.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "insights",
	describe: "show usage insights for the D1 databases in your account",

	builder: (yargs) => {
		return yargs
			.command($databases)
			.command($queries)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
