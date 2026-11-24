import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * addresses command group
 * @generated from apis/overlays/email-routing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "addresses",
	describe:
		"Verified destination email addresses that can receive forwarded mail",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
