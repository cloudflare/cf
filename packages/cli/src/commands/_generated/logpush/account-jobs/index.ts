import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * account-jobs command group
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "account-jobs",
	describe: "Operations for account-jobs",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
