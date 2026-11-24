import $get from "./get.js";
/**
 * os command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "os",
	describe: "Operations for http.top.locations.os",

	routes: {
		get: $get,
	},
});

export default command;
