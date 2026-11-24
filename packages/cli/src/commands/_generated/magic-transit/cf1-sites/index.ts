import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $ramps from "./ramps/index.js";
import $update from "./update.js";
/**
 * cf1-sites command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "cf1-sites",
	describe: "Operations for cf1-sites",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		ramps: $ramps,
	},
});

export default command;
