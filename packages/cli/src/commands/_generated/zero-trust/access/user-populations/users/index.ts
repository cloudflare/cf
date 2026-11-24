import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $replace from "./replace.js";
import $update from "./update.js";
/**
 * users command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "users",
	describe: "Operations for access.user-populations.users",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		replace: $replace,
		update: $update,
	},
});

export default command;
