import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $status from "./status/index.js";
import $update from "./update.js";
/**
 * worker command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "worker",
	describe: "Data Loss Prevention - manage Worker validators",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		status: $status,
	},
});

export default command;
