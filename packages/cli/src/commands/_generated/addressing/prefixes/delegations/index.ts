import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
/**
 * delegations command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "delegations",
	describe: "Operations for prefixes.delegations",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
	},
});

export default command;
