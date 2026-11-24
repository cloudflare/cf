import $accounts from "./accounts/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $ips from "./ips/index.js";
import $list from "./list.js";
import $zones from "./zones/index.js";
/**
 * address-maps command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "address-maps",
	describe: "Operations for address-maps",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		accounts: $accounts,
		ips: $ips,
		zones: $zones,
	},
});

export default command;
