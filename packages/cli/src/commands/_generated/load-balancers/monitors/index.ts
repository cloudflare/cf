import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $previews from "./previews/index.js";
import $references from "./references/index.js";
import $update from "./update.js";
/**
 * monitors command group
 * @generated from apis/overlays/load-balancers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "monitors",
	describe:
		"Health check configurations that probe origin servers and determine pool availability",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		update: $update,
		previews: $previews,
		references: $references,
	},
});

export default command;
