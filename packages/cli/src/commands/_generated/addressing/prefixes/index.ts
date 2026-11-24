import $advertisementstatus from "./advertisement-status/index.js";
import $bgpprefixes from "./bgp-prefixes/index.js";
import $create from "./create.js";
import $delegations from "./delegations/index.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $servicebindings from "./service-bindings/index.js";
import $validate from "./validate/index.js";
/**
 * prefixes command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "prefixes",
	describe: "Operations for prefixes",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		"advertisement-status": $advertisementstatus,
		"bgp-prefixes": $bgpprefixes,
		delegations: $delegations,
		"service-bindings": $servicebindings,
		validate: $validate,
	},
});

export default command;
