import $get from "./get.js";
import $update from "./update.js";
/**
 * hostnames command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "hostnames",
	describe: "Operations for origin-tls-client-auth.hostnames",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
