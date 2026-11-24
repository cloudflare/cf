import $batch from "./batch/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * members command group
 * @generated from apis/overlays/organizations.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "members",
	describe: "Members of an organization",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		batch: $batch,
	},
});

export default command;
