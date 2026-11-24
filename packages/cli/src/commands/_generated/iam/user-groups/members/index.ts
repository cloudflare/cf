import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * members command group
 * @generated from apis/overlays/iam.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "members",
	describe: "Operations for user-groups.members",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
