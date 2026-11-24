import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
/**
 * aegis command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "aegis",
	describe: "Aegis operations",

	routes: {
		delete: $delete,
		edit: $edit,
		get: $get,
	},
});

export default command;
