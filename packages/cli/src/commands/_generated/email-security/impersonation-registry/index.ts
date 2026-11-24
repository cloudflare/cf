import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * impersonation-registry command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "impersonation-registry",
	describe: "Operations for impersonation-registry",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
