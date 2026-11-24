import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * consumers command group
 * @generated from apis/overlays/queues.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "consumers",
	describe:
		"Workers that automatically receive and process messages from a queue",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
