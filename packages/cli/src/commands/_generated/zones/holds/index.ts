import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
/**
 * holds command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "holds",
	describe: "Operations for holds",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
	},
});

export default command;
