import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $instances from "./instances/index.js";
import $list from "./list.js";
import $rollouts from "./rollouts/index.js";
import $versions from "./versions/index.js";
/**
 * applications command group
 * @generated from apis/overlays/containers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "applications",
	describe: "Manage Containers applications",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		instances: $instances,
		rollouts: $rollouts,
		versions: $versions,
	},
});

export default command;
