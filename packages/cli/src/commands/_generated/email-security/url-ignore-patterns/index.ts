import $bulkapply from "./bulk-apply.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * url-ignore-patterns command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "url-ignore-patterns",
	describe: "Operations for url-ignore-patterns",

	routes: {
		"bulk-apply": $bulkapply,
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
