import $get from "./get.js";
import $update from "./update.js";
/**
 * config command group
 * @generated from apis/overlays/google-tag-gateway.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "config",
	describe: "Google Tag Gateway config operations",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
