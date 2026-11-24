import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $permissiongroups from "./permission-groups/index.js";
import $roll from "./roll.js";
import $update from "./update.js";
import $verify from "./verify.js";
/**
 * tokens command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tokens",
	describe:
		"Create and manage personal API tokens scoped to your user for programmatic API access",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		roll: $roll,
		update: $update,
		verify: $verify,
		"permission-groups": $permissiongroups,
	},
});

export default command;
