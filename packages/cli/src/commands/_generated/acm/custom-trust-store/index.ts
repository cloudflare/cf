import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * custom-trust-store command group
 * @generated from apis/overlays/acm.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "custom-trust-store",
	describe: "Operations for custom-trust-store",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
	},
});

export default command;
