import $datasets from "./datasets/index.js";
import $list from "./list/index.js";
import $query from "./query.js";
import $rayid from "./rayid/index.js";
import $received from "./received/index.js";
import $retrieve from "./retrieve/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * logs command
 * @generated from apis/overlays/logs.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "logs",
	describe:
		"Log control, retention, and raw log access — CMB config, ray ID lookups, and received fields",

	builder: (yargs) => {
		return yargs
			.command($query)
			.command($datasets)
			.command($list)
			.command($rayid)
			.command($received)
			.command($retrieve)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
