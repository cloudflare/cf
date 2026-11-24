import $get from "./get.js";
import $update from "./update.js";
/**
 * doh command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "doh",
	describe: "Operations for organization.doh",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
