import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $info from "./info.js";
import $list from "./list.js";
import $metadataindexes from "./metadata-indexes/index.js";
import $vectors from "./vectors/index.js";
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
			.command($get)
			.command($info)
			.command($list)
			.command($metadataindexes)
			.command($vectors)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
