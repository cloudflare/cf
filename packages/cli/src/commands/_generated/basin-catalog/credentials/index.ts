import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * credentials command group
 * @generated from apis/overlays/basin-catalog.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "credentials",
	describe:
		"Catalog access credentials for external query engines (Spark, Trino, etc.)",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
