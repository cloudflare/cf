import $bulkcreate from "./bulk-create.js";
import $bulkedit from "./bulk-edit.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * rules command group
 * @generated from apis/overlays/api-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rules",
	describe: "Operations for token-validation.rules",

	routes: {
		"bulk-create": $bulkcreate,
		"bulk-edit": $bulkedit,
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
