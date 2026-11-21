import $bulkdelete from "./bulk-delete.js";
import $bulkget from "./bulk-get.js";
import $insert from "./insert.js";
import $list from "./list.js";
import $query from "./query.js";
import $upsert from "./upsert.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * vectors command group
 * @generated from apis/overlays/vectorize.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "vectors",
	describe:
		"Insert, upsert, query, list, get and delete the vectors in an index",

	builder: (yargs) => {
		return yargs
			.command($bulkdelete)
			.command($bulkget)
			.command($insert)
			.command($list)
			.command($query)
			.command($upsert)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
