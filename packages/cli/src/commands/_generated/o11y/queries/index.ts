import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * queries command group
 * @generated from apis/overlays/o11y.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "queries",
	describe: "Operations for queries",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
