import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
/**
 * metadata-indexes command group
 * @generated from apis/overlays/vectorize.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "metadata-indexes",
	describe: "Metadata indexes for filtered vector search",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
	},
});

export default command;
