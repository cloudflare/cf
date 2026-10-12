import $create from "./create.js";
import $deletebyids from "./delete-by-ids.js";
import $delete from "./delete.js";
import $getbyids from "./get-by-ids.js";
import $get from "./get.js";
import $info from "./info.js";
import $insert from "./insert.js";
import $listvectors from "./list-vectors.js";
import $list from "./list.js";
import $metadataindex from "./metadata-index/index.js";
import $query from "./query.js";
import $upsert from "./upsert.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * vectorize command
 * @generated from apis/overlays/vectorize.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "vectorize",
	describe:
		"Globally distributed vector database for building semantic search, recommendations, and RAG applications on Workers",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($deletebyids)
			.command($get)
			.command($getbyids)
			.command($info)
			.command($insert)
			.command($list)
			.command($listvectors)
			.command($query)
			.command($upsert)
			.command($metadataindex)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
