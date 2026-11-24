import $available from "./available.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * datasets command group
 * @generated from apis/overlays/logs.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "datasets",
	describe: "Operations for datasets",

	routes: {
		available: $available,
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
