import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * deploy-hooks command group
 * @generated from apis/overlays/builds.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "deploy-hooks",
	describe: "Manage branch-specific HTTP hooks that start builds.",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
