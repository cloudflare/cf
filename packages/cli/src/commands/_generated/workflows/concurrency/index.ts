import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * concurrency command group
 * @generated from apis/overlays/workflows.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "concurrency",
	describe: "Operations for concurrency",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
