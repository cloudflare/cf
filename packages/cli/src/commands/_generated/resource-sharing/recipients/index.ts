import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $replace from "./replace.js";
/**
 * recipients command group
 * @generated from apis/overlays/resource-sharing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "recipients",
	describe: "Accounts that receive a share",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		replace: $replace,
	},
});

export default command;
