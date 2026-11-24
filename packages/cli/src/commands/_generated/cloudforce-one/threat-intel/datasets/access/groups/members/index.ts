import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
/**
 * members command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "members",
	describe: "Operations for threat-intel.datasets.access.groups.members",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
	},
});

export default command;
