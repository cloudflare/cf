import $create from "./create.js";
import $delete from "./delete.js";
import $getlevelorder from "./get-level-order.js";
import $get from "./get.js";
import $list from "./list.js";
import $updatelevelorder from "./update-level-order.js";
import $update from "./update.js";
/**
 * sensitivity-groups command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "sensitivity-groups",
	describe:
		"Data Loss Prevention - manage sensitivity groups and their level ordering",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		"get-level-order": $getlevelorder,
		list: $list,
		update: $update,
		"update-level-order": $updatelevelorder,
	},
});

export default command;
