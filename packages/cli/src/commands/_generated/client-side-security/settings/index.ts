import $get from "./get.js";
import $update from "./update.js";
/**
 * settings command group
 * @generated from apis/overlays/client-side-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Fine tune Client-Side Security behaviors",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
