import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * namespace command group
 * @generated from apis/overlays/ai-search.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "namespace",
	describe: "Logical groupings for organizing AI Search instances",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
