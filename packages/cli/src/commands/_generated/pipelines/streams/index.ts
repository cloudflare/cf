import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * streams command group
 * @generated from apis/overlays/pipelines.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "streams",
	describe:
		"Inbound data streams that feed events into a pipeline for processing",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
