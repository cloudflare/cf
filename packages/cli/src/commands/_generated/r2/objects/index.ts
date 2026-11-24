import $bulkdelete from "./bulk-delete.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $put from "./put.js";
/**
 * objects command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "objects",
	describe: "Operations for objects",

	routes: {
		"bulk-delete": $bulkdelete,
		delete: $delete,
		get: $get,
		list: $list,
		put: $put,
	},
});

export default command;
