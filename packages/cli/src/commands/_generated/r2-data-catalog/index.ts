import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * r2-data-catalog command
 * @generated from apis/overlays/r2-data-catalog.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "r2-data-catalog",
	describe:
		"Iceberg-compatible data catalog for R2 — organize objects into tables and namespaces for SQL query engines",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
