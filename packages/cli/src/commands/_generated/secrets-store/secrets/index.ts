import $bulkdelete from "./bulk-delete.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $duplicate from "./duplicate.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * secrets command group
 * @generated from apis/overlays/secrets-store.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "secrets",
	describe:
		"Encrypted key-value secrets within a store. Pass --store-id to scope.",

	routes: {
		"bulk-delete": $bulkdelete,
		create: $create,
		delete: $delete,
		duplicate: $duplicate,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
