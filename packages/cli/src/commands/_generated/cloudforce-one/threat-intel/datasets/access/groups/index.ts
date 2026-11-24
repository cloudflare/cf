import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $members from "./members/index.js";
import $update from "./update.js";
/**
 * groups command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "groups",
	describe: "Operations for threat-intel.datasets.access.groups",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		members: $members,
	},
});

export default command;
