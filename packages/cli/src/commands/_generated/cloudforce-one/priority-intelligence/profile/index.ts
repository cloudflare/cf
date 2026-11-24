import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * profile command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "profile",
	describe: "Operations for priority-intelligence.profile",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
