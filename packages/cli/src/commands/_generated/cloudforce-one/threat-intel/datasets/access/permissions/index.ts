import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * permissions command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "permissions",
	describe: "Operations for threat-intel.datasets.access.permissions",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
		update: $update,
	},
});

export default command;
