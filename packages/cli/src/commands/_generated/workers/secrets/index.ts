import $bulkedit from "./bulk-edit.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * secrets command group
 * @generated from apis/overlays/workers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "secrets",
	describe: "Manage secrets bound to Worker scripts",

	routes: {
		"bulk-edit": $bulkedit,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
