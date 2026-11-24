import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $nodes from "./nodes/index.js";
import $update from "./update.js";
/**
 * tenant-structures command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tenant-structures",
	describe: "Operations for cws.tenant-structures",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		nodes: $nodes,
	},
});

export default command;
