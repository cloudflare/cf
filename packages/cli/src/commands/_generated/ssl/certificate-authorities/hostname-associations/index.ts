import $get from "./get.js";
import $update from "./update.js";
/**
 * hostname-associations command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "hostname-associations",
	describe: "Operations for certificate-authorities.hostname-associations",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
