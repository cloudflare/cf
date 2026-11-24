import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $validate from "./validate.js";
/**
 * ownership command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ownership",
	describe: "Operations for pcaps.ownership",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		validate: $validate,
	},
});

export default command;
