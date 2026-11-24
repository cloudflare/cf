import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * netflow-config command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "netflow-config",
	describe: "Operations for sites.netflow-config",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		update: $update,
	},
});

export default command;
