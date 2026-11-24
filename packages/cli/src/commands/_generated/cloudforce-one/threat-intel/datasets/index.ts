import $access from "./access/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $populate from "./populate.js";
import $preferences from "./preferences/index.js";
import $update from "./update.js";
/**
 * datasets command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "datasets",
	describe: "Operations for threat-intel.datasets",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		populate: $populate,
		update: $update,
		access: $access,
		preferences: $preferences,
	},
});

export default command;
