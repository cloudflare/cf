import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * account-resources command group
 * @generated from apis/overlays/tags.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "account-resources",
	describe: "Operations for account-resources",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
