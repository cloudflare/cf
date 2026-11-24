import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $info from "./info.js";
import $list from "./list.js";
import $metadataindexes from "./metadata-indexes/index.js";
import $vectors from "./vectors/index.js";
/**
 * vectorize command
 * @generated from apis/overlays/vectorize.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "vectorize",
	describe:
		"Globally distributed vector database for building semantic search, recommendations, and RAG applications on Workers",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		info: $info,
		list: $list,
		"metadata-indexes": $metadataindexes,
		vectors: $vectors,
	},
});

export default command;
