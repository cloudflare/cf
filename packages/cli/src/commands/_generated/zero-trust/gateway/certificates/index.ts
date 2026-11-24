import $activate from "./activate.js";
import $create from "./create.js";
import $deactivate from "./deactivate.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * certificates command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "certificates",
	describe: "Operations for gateway.certificates",

	routes: {
		activate: $activate,
		create: $create,
		deactivate: $deactivate,
		delete: $delete,
		get: $get,
		list: $list,
	},
});

export default command;
