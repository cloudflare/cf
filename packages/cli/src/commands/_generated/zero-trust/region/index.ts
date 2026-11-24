import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * region command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "region",
	describe: "Operations for region",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
