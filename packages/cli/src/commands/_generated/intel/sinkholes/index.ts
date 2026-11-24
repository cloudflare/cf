import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $ingresses from "./ingresses/index.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * sinkholes command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "sinkholes",
	describe: "Operations for sinkholes",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		ingresses: $ingresses,
	},
});

export default command;
