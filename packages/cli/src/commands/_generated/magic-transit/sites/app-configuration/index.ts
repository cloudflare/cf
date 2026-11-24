import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * app-configuration command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "app-configuration",
	describe: "Operations for sites.app-configuration",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
		update: $update,
	},
});

export default command;
