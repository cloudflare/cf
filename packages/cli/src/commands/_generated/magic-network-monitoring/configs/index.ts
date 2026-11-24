import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $full from "./full/index.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * configs command group
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "configs",
	describe:
		"Account-level monitoring configuration — sampling rates, thresholds, and notification settings",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		update: $update,
		full: $full,
	},
});

export default command;
