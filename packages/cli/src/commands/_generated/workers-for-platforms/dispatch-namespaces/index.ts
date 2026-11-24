import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $scripts from "./scripts/index.js";
/**
 * dispatch-namespaces command group
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dispatch-namespaces",
	describe: "Isolate and route requests to many individual user Workers",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		scripts: $scripts,
	},
});

export default command;
