import $get from "./get.js";
import $update from "./update.js";
/**
 * session-identifiers command group
 * @generated from apis/overlays/api-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "session-identifiers",
	describe: "Operations for session-identifiers",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
