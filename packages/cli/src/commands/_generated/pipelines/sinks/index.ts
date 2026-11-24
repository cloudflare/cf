import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * sinks command group
 * @generated from apis/overlays/pipelines.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "sinks",
	describe:
		"Destinations where pipeline data is written — R2 buckets, HTTP endpoints, or other storage",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
