import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import $usage from "./usage/index.js";
/**
 * account command group
 * @generated from apis/overlays/load-balancers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "account",
	describe:
		"Account-scoped load balancers that distribute traffic without requiring a DNS hostname",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		update: $update,
		usage: $usage,
	},
});

export default command;
