import $bulkdelete from "./bulk-delete.js";
import $bulkget from "./bulk-get.js";
import $insert from "./insert.js";
import $list from "./list.js";
import $query from "./query.js";
import $upsert from "./upsert.js";
/**
 * vectors command group
 * @generated from apis/overlays/vectorize.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "vectors",
	describe:
		"Insert, upsert, query, list, get and delete the vectors in an index",

	routes: {
		"bulk-delete": $bulkdelete,
		"bulk-get": $bulkget,
		insert: $insert,
		list: $list,
		query: $query,
		upsert: $upsert,
	},
});

export default command;
