import $get from "./get.js";
/**
 * browser-family command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "browser-family",
	describe: "Operations for http.top.locations.browser-family",

	routes: {
		get: $get,
	},
});

export default command;
