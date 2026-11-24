import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $integration from "./integration/index.js";
import $list from "./list.js";
import $replace from "./replace.js";
import $restart from "./restart.js";
/**
 * hyperdrive command
 * @generated from apis/overlays/hyperdrive.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "hyperdrive",
	describe:
		"Accelerate access to existing databases by caching queries and pooling connections at the edge",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		replace: $replace,
		restart: $restart,
		integration: $integration,
	},
});

export default command;
