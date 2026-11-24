import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * locks command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "locks",
	describe: "Operations for buckets.locks",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
