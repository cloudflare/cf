import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * tags command group
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tags",
	describe: "Operations for dispatch-namespaces.scripts.tags",

	routes: {
		delete: $delete,
		list: $list,
		update: $update,
	},
});

export default command;
