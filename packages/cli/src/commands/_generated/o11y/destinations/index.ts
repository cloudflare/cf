import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * destinations command group
 * @generated from apis/overlays/o11y.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "destinations",
	describe: "Operations for destinations",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
		update: $update,
	},
});

export default command;
