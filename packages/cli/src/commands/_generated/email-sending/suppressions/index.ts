import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $import from "./import.js";
import $list from "./list.js";
/**
 * suppressions command group
 * @generated from apis/overlays/email-sending.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "suppressions",
	describe:
		"Prevent delivery to suppressed addresses and manage the account suppression list",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		import: $import,
		list: $list,
	},
});

export default command;
