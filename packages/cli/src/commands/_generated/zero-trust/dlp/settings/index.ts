import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * settings command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Data Loss Prevention - manage account-level settings",

	routes: {
		delete: $delete,
		edit: $edit,
		get: $get,
		update: $update,
	},
});

export default command;
