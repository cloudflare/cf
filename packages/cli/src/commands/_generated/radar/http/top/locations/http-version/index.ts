import $get from "./get.js";
/**
 * http-version command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "http-version",
	describe: "Operations for http.top.locations.http-version",

	routes: {
		get: $get,
	},
});

export default command;
