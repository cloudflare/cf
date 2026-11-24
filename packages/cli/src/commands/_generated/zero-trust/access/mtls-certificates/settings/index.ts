import $get from "./get.js";
import $update from "./update.js";
/**
 * settings command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Operations for access.mtls-certificates.settings",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
