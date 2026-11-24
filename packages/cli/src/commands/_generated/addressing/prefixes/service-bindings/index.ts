import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * service-bindings command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "service-bindings",
	describe: "Operations for prefixes.service-bindings",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
	},
});

export default command;
