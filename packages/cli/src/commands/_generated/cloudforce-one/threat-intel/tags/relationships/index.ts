import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * relationships command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "relationships",
	describe: "Operations for threat-intel.tags.relationships",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
		update: $update,
	},
});

export default command;
