import $bulkoperations from "./bulk-operations/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $items from "./items/index.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * lists command group
 * @generated from apis/overlays/rules.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "lists",
	describe:
		"Custom account-level lists of IPs, hostnames, ASNs, or redirects used in rule expressions",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		"bulk-operations": $bulkoperations,
		items: $items,
	},
});

export default command;
