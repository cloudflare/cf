import $bulkupdate from "./bulk-update.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $pskgenerate from "./psk-generate.js";
import $pskset from "./psk-set.js";
import $update from "./update.js";
/**
 * ipsec-tunnels command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ipsec-tunnels",
	describe:
		"IPsec tunnel endpoints with pre-shared key management for encrypted transit",

	routes: {
		"bulk-update": $bulkupdate,
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		"psk-generate": $pskgenerate,
		"psk-set": $pskset,
		update: $update,
	},
});

export default command;
