import $bulkupdate from "./bulk-update.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * cf-interconnects command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "cf-interconnects",
	describe:
		"Cloudflare Network Interconnect (CNI) links for direct physical or virtual peering",

	routes: {
		"bulk-update": $bulkupdate,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
