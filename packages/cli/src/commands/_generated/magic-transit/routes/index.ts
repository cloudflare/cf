import $bulkupdate from "./bulk-update.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $empty from "./empty.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * routes command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "routes",
	describe:
		"Static routes that direct IP prefix traffic through specific GRE/IPsec tunnels",

	routes: {
		"bulk-update": $bulkupdate,
		create: $create,
		delete: $delete,
		empty: $empty,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
