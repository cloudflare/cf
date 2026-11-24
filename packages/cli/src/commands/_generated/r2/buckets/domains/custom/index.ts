import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * custom command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "custom",
	describe: "Operations for buckets.domains.custom",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
