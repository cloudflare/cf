import $delete from "./delete.js";
import $get from "./get.js";
import $replace from "./replace.js";
import $update from "./update.js";
/**
 * trust-settings command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "trust-settings",
	describe: "Operations for organization.trust-settings",

	routes: {
		delete: $delete,
		get: $get,
		replace: $replace,
		update: $update,
	},
});

export default command;
