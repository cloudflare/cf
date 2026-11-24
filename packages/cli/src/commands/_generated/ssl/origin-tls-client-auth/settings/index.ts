import $get from "./get.js";
import $update from "./update.js";
/**
 * settings command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Operations for origin-tls-client-auth.settings",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
