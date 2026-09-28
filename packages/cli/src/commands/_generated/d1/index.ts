import $migrations from "#commands/d1/migrations/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $export from "./export.js";
import $get from "./get.js";
import $import from "./import.js";
import $list from "./list.js";
import $query from "./query.js";
import $raw from "./raw.js";
import $timetravel from "./time-travel/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * d1 command
 * @generated from apis/overlays/d1.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "d1",
	describe:
		"D1 is Cloudflare's managed, serverless database with SQLite's SQL semantics, built-in disaster recovery, and Worker and HTTP API access.",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($export)
			.command($get)
			.command($import)
			.command($list)
			.command($query)
			.command($raw)
			.command($update)
			.command($migrations)
			.command($timetravel)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
