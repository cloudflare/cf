import $bulkdelete from "./bulk-delete.js";
import $bulk from "./bulk/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * prefixes command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "prefixes",
	describe: "Operations for advanced-tcp-protection.configs.prefixes",

	routes: {
		"bulk-delete": $bulkdelete,
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		bulk: $bulk,
	},
});

export default command;
