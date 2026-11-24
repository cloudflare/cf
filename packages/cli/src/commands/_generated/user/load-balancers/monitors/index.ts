import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $preview from "./preview/index.js";
import $references from "./references/index.js";
import $update from "./update.js";
/**
 * monitors command group
 * @generated from apis/overlays/user.ts
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
		preview: $preview,
		references: $references,
	},
});

export default command;
