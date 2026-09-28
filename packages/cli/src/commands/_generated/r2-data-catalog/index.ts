import $credentials from "./credentials/index.js";
import $delete from "./delete.js";
import $disable from "./disable.js";
import $enable from "./enable.js";
import $get from "./get.js";
import $list from "./list.js";
import $maintenanceconfigs from "./maintenance-configs/index.js";
import $namespaces from "./namespaces/index.js";
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
			.command($delete)
			.command($disable)
			.command($enable)
			.command($get)
			.command($list)
			.command($credentials)
			.command($maintenanceconfigs)
			.command($namespaces)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
