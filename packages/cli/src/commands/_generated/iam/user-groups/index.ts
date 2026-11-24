import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $members from "./members/index.js";
import $update from "./update.js";
/**
 * user-groups command group
 * @generated from apis/overlays/iam.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "user-groups",
	describe:
		"Organize account members into groups for easier permission assignment",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		members: $members,
	},
});

export default command;
