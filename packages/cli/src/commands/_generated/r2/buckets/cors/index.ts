import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * cors command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "cors",
	describe: "Operations for buckets.cors",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
