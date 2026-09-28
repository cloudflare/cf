import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $legacycreate from "./legacy-create.js";
import $legacydelete from "./legacy-delete.js";
import $legacyget from "./legacy-get.js";
import $legacylist from "./legacy-list.js";
import $legacyupdate from "./legacy-update.js";
import $list from "./list.js";
import $sinks from "./sinks/index.js";
import $streams from "./streams/index.js";
import $validatesql from "./validate-sql.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * pipelines command
 * @generated from apis/overlays/pipelines.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "pipelines",
	describe:
		"Ingest, transform, and route event streams into R2, analytics, or other destinations in real time",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($legacycreate)
			.command($legacydelete)
			.command($legacyget)
			.command($legacylist)
			.command($legacyupdate)
			.command($list)
			.command($validatesql)
			.command($sinks)
			.command($streams)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
