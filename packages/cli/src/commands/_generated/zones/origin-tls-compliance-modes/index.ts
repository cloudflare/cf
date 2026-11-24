import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * origin-tls-compliance-modes command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "origin-tls-compliance-modes",
	describe: "Manage zone Origin TLS Compliance Modes setting",

	routes: {
		delete: $delete,
		edit: $edit,
		get: $get,
		update: $update,
	},
});

export default command;
