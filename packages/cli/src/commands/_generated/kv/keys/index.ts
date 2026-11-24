import $bulkdelete from "./bulk-delete.js";
import $bulkget from "./bulk-get.js";
import $bulkput from "./bulk-put.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $put from "./put.js";
/**
 * keys command group
 * @generated from apis/overlays/kv.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "keys",
	describe: "Operations for keys",

	routes: {
		"bulk-delete": $bulkdelete,
		"bulk-get": $bulkget,
		"bulk-put": $bulkput,
		delete: $delete,
		get: $get,
		list: $list,
		put: $put,
	},
});

export default command;
