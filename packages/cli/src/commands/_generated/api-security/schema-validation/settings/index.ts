import $edit from "./edit.js";
import $get from "./get.js";
import $operations from "./operations/index.js";
import $update from "./update.js";
/**
 * settings command group
 * @generated from apis/overlays/api-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Operations for schema-validation.settings",

	routes: {
		edit: $edit,
		get: $get,
		update: $update,
		operations: $operations,
	},
});

export default command;
