import $bulkedit from "./bulk-edit.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * operations command group
 * @generated from apis/overlays/api-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "operations",
	describe: "Operations for schema-validation.settings.operations",

	routes: {
		"bulk-edit": $bulkedit,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
