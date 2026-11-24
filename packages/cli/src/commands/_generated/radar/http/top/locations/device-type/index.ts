import $get from "./get.js";
/**
 * device-type command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "device-type",
	describe: "Operations for http.top.locations.device-type",

	routes: {
		get: $get,
	},
});

export default command;
