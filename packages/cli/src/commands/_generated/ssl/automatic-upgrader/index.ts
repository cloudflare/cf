import $get from "./get.js";
import $patch from "./patch.js";
/**
 * automatic-upgrader command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "automatic-upgrader",
	describe:
		"SSL automatic mode enrollment — get or update automatic SSL/TLS upgrader settings",

	routes: {
		get: $get,
		patch: $patch,
	},
});

export default command;
